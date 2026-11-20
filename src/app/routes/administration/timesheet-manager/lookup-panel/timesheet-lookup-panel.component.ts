import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ITimesheetLookup } from 'src/app/shared';
import { ToastService } from 'src/app/shared/services/toast.service';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';
import { TimesheetAdminService, TimesheetLookupKind } from '../../services/timesheet-admin.service';
import { TimesheetNameDialogComponent, TimesheetNameDialogData } from '../name-dialog/timesheet-name-dialog.component';

/**
 * Manages one timesheet lookup list (activities or work types).
 * Values in use can't be deleted, only archived: archived values are hidden from
 * the capture form but still show on existing entries. Renames apply to all history.
 */
@Component({
  selector: 'app-timesheet-lookup-panel',
  templateUrl: './timesheet-lookup-panel.component.html',
  styleUrls: ['./timesheet-lookup-panel.component.scss']
})
export class TimesheetLookupPanelComponent implements OnInit, OnDestroy {
  @Input() kind!: TimesheetLookupKind;
  /** Plural heading, e.g. "Activities". */
  @Input() title = '';
  /** Singular, lower case, e.g. "activity". */
  @Input() singular = '';
  @Input() description = '';
  @Input() icon = 'label';

  items: ITimesheetLookup[] = [];
  loading = true;
  showArchived = false;
  busyIds = new Set<number>();

  private destroy$ = new Subject<void>();

  constructor(
    private service: TimesheetAdminService,
    private dialog: MatDialog,
    private toast: ToastService,
    private notify: NotificationUtil
  ) { }

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get visible(): ITimesheetLookup[] {
    return this.showArchived ? this.items : this.items.filter(i => i.is_active);
  }

  get activeCount(): number {
    return this.items.filter(i => i.is_active).length;
  }

  get archivedCount(): number {
    return this.items.length - this.activeCount;
  }

  load(): void {
    this.loading = true;
    this.service.getLookups(this.kind).pipe(takeUntil(this.destroy$)).subscribe({
      next: resp => {
        this.items = resp.data;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.notify.showError(TimesheetAdminService.errorMessage(err, `Failed to load ${this.title.toLowerCase()}`));
      }
    });
  }

  openDialog(item?: ITimesheetLookup): void {
    const label = this.capitalise(this.singular);
    const data: TimesheetNameDialogData = {
      title: item ? `Rename ${this.singular}` : `New ${this.singular}`,
      label: `${label} name`,
      value: item?.name,
      save: name => item
        ? this.service.updateLookup(this.kind, item.id, { name })
        : this.service.createLookup(this.kind, name)
    };

    this.dialog.open(TimesheetNameDialogComponent, { data, width: '440px' })
      .afterClosed().subscribe((saved?: ITimesheetLookup) => {
        if (!saved) return;
        this.upsert(saved);
        this.notify.showSuccess(item
          ? `${label} renamed${item.usage_count ? ` on ${item.usage_count} existing entries` : ''}`
          : `${label} created`);
      });
  }

  toggleArchived(item: ITimesheetLookup): void {
    const archiving = item.is_active;
    this.busyIds.add(item.id);
    this.service.updateLookup(this.kind, item.id, { is_active: !archiving }).subscribe({
      next: resp => {
        this.busyIds.delete(item.id);
        this.upsert(resp.data);
        this.notify.showSuccess(resp.message);
      },
      error: err => {
        this.busyIds.delete(item.id);
        this.notify.showError(TimesheetAdminService.errorMessage(err, `Failed to ${archiving ? 'archive' : 'restore'} ${this.singular}`));
      }
    });
  }

  remove(item: ITimesheetLookup): void {
    this.toast.openConfirmBox('danger', `Delete ${this.singular}`, `Delete "${item.name}"?`).subscribe(resp => {
      if (!resp.success) return;
      this.busyIds.add(item.id);
      this.service.deleteLookup(this.kind, item.id).subscribe({
        next: () => {
          this.busyIds.delete(item.id);
          this.items = this.items.filter(i => i.id !== item.id);
          this.notify.showSuccess(`${this.capitalise(this.singular)} deleted`);
        },
        error: err => {
          this.busyIds.delete(item.id);
          this.notify.showError(TimesheetAdminService.errorMessage(err, `Failed to delete ${this.singular}`));
        }
      });
    });
  }

  trackById(_: number, item: ITimesheetLookup): number {
    return item.id;
  }

  private upsert(item: ITimesheetLookup | null): void {
    if (!item) return;
    const exists = this.items.some(i => i.id === item.id);
    this.items = (exists ? this.items.map(i => i.id === item.id ? item : i) : [...this.items, item])
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private capitalise(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
