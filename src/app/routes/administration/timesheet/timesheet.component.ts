import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { ToastService } from 'src/app/shared/services/toast.service';
import { TimesheetFormComponent, TimesheetFormResult } from './timesheet-form/timesheet-form.component';
import { TimesheetService } from '../services/timesheet.service';
import { ITimesheet, IUser } from 'src/app/shared';
import * as moment from 'moment';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TableUtil } from 'src/app/shared/utils/tableUtil';
import { DurationUtil } from 'src/app/shared/utils/duration.util';
import { AuthService } from 'src/app/core';
import { TimesheetInvoiceComponent } from './timesheet-invoice/timesheet-invoice.component';
import { Subject, takeUntil } from 'rxjs';
import { formatRange, Period, periodRange, PERIODS, toIsoDate } from './timesheet-period';

interface DayGroup {
  date: string;
  label: string;
  sublabel: string;
  totalSeconds: number;
  entries: ITimesheet[];
}

@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.scss']
})
export class TimesheetComponent implements OnInit, OnDestroy {
  // ----- My Timesheet -----
  timesheet: ITimesheet[] = [];
  disbursmentItems: any[] = [];
  loading = false;

  readonly periods = PERIODS;
  period: Period = 'this_month';

  /** API filters. Dates are always 'YYYY-MM-DD' strings. */
  form: FormGroup;
  /** Date objects for the custom range picker. */
  customRange: FormGroup;
  search = '';

  dayGroups: DayGroup[] = [];
  totalSeconds = 0;
  filteredCount = 0;

  @ViewChild('disbursementPanel') disbursementPanel?: MatExpansionPanel;
  @ViewChild('disbursementPanel', { read: ElementRef }) disbursementPanelEl?: ElementRef<HTMLElement>;

  companies: any[] = [];
  user!: IUser;
  users: IUser[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private _timesheetService: TimesheetService,
    public dialog: MatDialog,
    private toast: ToastService,
    private fb: FormBuilder,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      start_date: [null],
      end_date: [null],
      user_id: [null],
      company_id: [null]
    });

    this.customRange = this.fb.group({
      start: [null],
      end: [null]
    });
  }

  ngOnInit(): void {
    this.setPeriod('this_month');
    this.getCompanies();
    this.auth.user().pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user) {
        this.user = user;
      }
      if (user?.role === 'admin') {
        this.getUsers();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  // ---------------------------------------------------------------------
  // Filters
  // ---------------------------------------------------------------------

  setPeriod(period: Period): void {
    this.period = period;
    if (period === 'custom') {
      // Start the custom picker on whatever range is currently shown
      const { start_date, end_date } = this.form.value;
      this.customRange.setValue({
        start: start_date ? moment(start_date).toDate() : null,
        end: end_date ? moment(end_date).toDate() : null
      });
      return;
    }

    const { start, end } = periodRange(period);
    this.form.patchValue({ start_date: start, end_date: end });
    this.loadTimesheet();
  }

  onCustomRangeChange(): void {
    const { start, end } = this.customRange.value;
    if (!start || !end) return;
    this.form.patchValue({ start_date: toIsoDate(start), end_date: toIsoDate(end) });
    this.loadTimesheet();
  }

  get periodLabel(): string {
    return formatRange(this.form.value.start_date, this.form.value.end_date);
  }

  onSearch(value: string): void {
    this.search = value;
    this.rebuildGroups();
  }

  clearSearch(): void {
    this.onSearch('');
  }

  // ---------------------------------------------------------------------
  // Data
  // ---------------------------------------------------------------------

  loadTimesheet(): void {
    this.loading = true;
    this._timesheetService.getTimesheet(this.form.value).pipe(takeUntil(this.destroy$)).subscribe({
      next: resp => {
        this.timesheet = resp.data.timesheetItems ?? [];
        this.disbursmentItems = resp.data.disbursementItems ?? [];
        this.rebuildGroups();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching timesheet:', err);
        this.loading = false;
        this.toast.toastNotification('danger', 'Error', 'Failed to fetch timesheet.');
      }
    });
  }

  private get filteredEntries(): ITimesheet[] {
    const term = this.search.trim().toLowerCase();
    if (!term) return this.timesheet;
    return this.timesheet.filter(e =>
      [e.project_name, e.company_name, e.general_activity, e.work_type, e.comment]
        .some(v => (v ?? '').toString().toLowerCase().includes(term)));
  }

  /** Groups entries by day (newest first) with daily totals. */
  private rebuildGroups(): void {
    const entries = this.filteredEntries;
    const byDate = new Map<string, ITimesheet[]>();
    for (const entry of entries) {
      const list = byDate.get(entry.date) ?? [];
      list.push(entry);
      byDate.set(entry.date, list);
    }

    const today = moment();
    this.dayGroups = [...byDate.keys()]
      .sort((a, b) => b.localeCompare(a))
      .map(date => {
        const day = moment(date, 'YYYY-MM-DD');
        const dayEntries = byDate.get(date)!.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
        const relative = day.isSame(today, 'day') ? 'Today'
          : day.isSame(today.clone().subtract(1, 'day'), 'day') ? 'Yesterday' : '';
        return {
          date,
          label: day.format(day.isSame(today, 'year') ? 'dddd, D MMMM' : 'dddd, D MMMM YYYY'),
          sublabel: relative,
          totalSeconds: dayEntries.reduce((sum, e) => sum + this.seconds(e.duration), 0),
          entries: dayEntries
        };
      });

    this.filteredCount = entries.length;
    this.totalSeconds = entries.reduce((sum, e) => sum + this.seconds(e.duration), 0);
  }

  // ---------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------

  get daysLogged(): number {
    return this.dayGroups.length;
  }

  get averagePerDay(): string {
    return this.daysLogged ? DurationUtil.toLabel(this.totalSeconds / this.daysLogged) : '0m';
  }

  get disbursementTotal(): number {
    return this.disbursmentItems.reduce((sum, i) => sum + Number(i.units || 0) * Number(i.price_per_unit || 0), 0);
  }

  showDisbursements(): void {
    this.disbursementPanel?.open();
    setTimeout(() => this.disbursementPanelEl?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  label(seconds: number): string {
    return DurationUtil.toLabel(seconds);
  }

  entryLabel(entry: ITimesheet): string {
    return DurationUtil.toLabel(this.seconds(entry.duration));
  }

  hasComment(entry: ITimesheet): boolean {
    return !!entry.comment && entry.comment.trim() !== '' && entry.comment !== '0';
  }

  private seconds(duration: string): number {
    return DurationUtil.parse(duration) ?? 0;
  }

  trackByDate(_: number, g: DayGroup): string {
    return g.date;
  }

  trackById(_: number, e: ITimesheet): number {
    return e.id;
  }

  // ---------------------------------------------------------------------
  // Capture / edit / delete
  // ---------------------------------------------------------------------

  openDialog(entry?: ITimesheet): void {
    this.dialog.open<TimesheetFormComponent, Partial<ITimesheet> | null, TimesheetFormResult>(TimesheetFormComponent, {
      data: entry ?? null,
      panelClass: 'side-panel-dialog',
      backdropClass: 'side-panel-backdrop',
      position: { right: '0', top: '0' },
      height: '100%',
      width: '580px',
      maxWidth: '100vw',
      autoFocus: 'dialog',
      disableClose: true // the form asks before discarding unsaved entries
    }).afterClosed().subscribe(result => {
      if (!result) return;
      const message = result.updated
        ? 'Entry updated'
        : `${result.saved} ${result.saved === 1 ? 'entry' : 'entries'} saved`;
      this.toast.toastNotification('success', 'Saved', message);
      this.loadTimesheet();
    });
  }

  deleteItem(entry: ITimesheet): void {
    const what = `${entry.project_name} › ${entry.company_name} (${this.entryLabel(entry)}) on ${moment(entry.date).format('D MMM')}`;
    this.toast.openConfirmBox('danger', 'Delete entry', `Delete ${what}?`).subscribe(resp => {
      if (!resp.success) return;
      this._timesheetService.delete(entry.id).subscribe({
        next: () => {
          this.toast.toastNotification('success', 'Deleted', 'Timesheet entry deleted');
          this.timesheet = this.timesheet.filter(t => t.id !== entry.id);
          this.rebuildGroups();
        },
        error: (err) => {
          console.error('Error deleting timesheet entry:', err);
          this.toast.toastNotification('danger', 'Error', 'Failed to delete timesheet entry.');
        }
      });
    });
  }

  // ---------------------------------------------------------------------
  // Export / invoice
  // ---------------------------------------------------------------------

  private exportFileName(): string {
    return `${this.getSelectedEmployeeName()} Timesheet ${this.form.value.start_date} to ${this.form.value.end_date}`;
  }

  private exportRows(): ITimesheet[] {
    return [...this.filteredEntries].sort((a, b) => a.date.localeCompare(b.date) || (a.id ?? 0) - (b.id ?? 0));
  }

  exportToExcel(): void {
    if (!this.filteredCount) return this.notifyNothingToExport();
    TableUtil.exportArrayToExcel(this.exportRows().map(e => ({
      Date: e.date,
      Project: e.project_name,
      Company: e.company_name,
      'General Activity': e.general_activity ?? '',
      'Work Type': e.work_type ?? '',
      Time: e.duration,
      Comment: this.hasComment(e) ? e.comment : ''
    })), this.exportFileName());
  }

  exportToPDF(): void {
    if (!this.filteredCount) return this.notifyNothingToExport();
    const rows = this.exportRows().map(e => [
      e.date, e.project_name, e.company_name, e.general_activity ?? '', e.work_type ?? '', e.duration,
      this.hasComment(e) ? e.comment : ''
    ]);
    rows.push(['', '', '', '', 'Total', DurationUtil.toHms(this.totalSeconds), '']);
    TableUtil.exportArrayToPDF(
      ['Date', 'Project', 'Company', 'General Activity', 'Work Type', 'Time', 'Comment'],
      rows,
      this.exportFileName(),
      `${this.getSelectedEmployeeName()} timesheet (${this.periodLabel})`
    );
  }

  private notifyNothingToExport(): void {
    this.toast.toastNotification('warning', 'Nothing to export', 'There are no entries for the selected filters.');
  }

  openInvoiceDialog(): void {
    if (!this.timesheet.length) {
      this.toast.toastNotification('danger', 'Error', 'No timesheet entries to generate invoice.');
      return;
    }

    this.dialog.open(TimesheetInvoiceComponent, {
      data: {
        timesheet: this.timesheet,
        disbursmentItems: this.disbursmentItems,
        employee_name: this.getSelectedEmployeeName(),
        startDate: this.form.value['start_date'],
        endDate: this.form.value['end_date']
      },
      width: '520px',
      maxWidth: '95vw',
      autoFocus: false
    });
  }

  // ---------------------------------------------------------------------
  // Lookups
  // ---------------------------------------------------------------------

  getCompanies(): void {
    this._timesheetService.getAllCompanies().subscribe({
      next: resp => {
        this.companies = resp.data;
      },
      error: (err) => {
        console.error('Error fetching companies:', err);
        this.toast.toastNotification('danger', 'Error', 'Failed to fetch companies.');
      }
    });
  }

  getUsers(): void {
    if (this.users.length) {
      return;
    }

    this.auth.getAllUsers().subscribe({
      next: resp => {
        this.users = resp.data;
      },
      error: console.log
    });
  }

  getSelectedEmployeeName(): string {
    const selectedId = this.form.value['user_id'];
    const employee = selectedId ? this.users.find(u => String(u.id) === String(selectedId)) : this.user;
    return employee ? `${employee.first_name} ${employee.last_name}` : 'you';
  }

  get viewingSomeoneElse(): boolean {
    const selectedId = this.form.value['user_id'];
    return !!selectedId && String(selectedId) !== String(this.user?.id);
  }
}
