import { Component, ElementRef, Inject, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { ITimesheet, ITimesheetLookup } from 'src/app/shared';
import { DurationUtil } from 'src/app/shared/utils/duration.util';
import { TimesheetService } from '../../services/timesheet.service';

export interface TimesheetFormResult {
  saved: number;
  updated: boolean;
}

/** The API returns DB ids as strings; lookup option ids are numbers, and mat-select compares with ===. */
function toId(value: unknown): number | null {
  return value === null || value === undefined || value === '' ? null : Number(value);
}

interface ProjectOption { id: number; project_name: string; }
interface CompanyOption { id: number; company_name: string; status: string; }

/**
 * Side panel for logging time. Pick the date once, then add as many entries as needed.
 * "Add another" copies the previous entry's project, company, activity and work type.
 * Opened with an ITimesheet (has id) it edits that single entry instead.
 */
@Component({
  selector: 'app-timesheet-form',
  templateUrl: './timesheet-form.component.html',
  styleUrls: ['./timesheet-form.component.scss']
})
export class TimesheetFormComponent implements OnInit, OnDestroy {
  form: FormGroup;
  isEditMode = false;
  saving = false;
  error = '';
  confirmDiscard = false;

  /** Managed by admins on Timesheet Setup. Includes archived values so existing entries still display. */
  activities: ITimesheetLookup[] = [];
  workTypes: ITimesheetLookup[] = [];
  readonly quickDurations = [
    { label: '15m', value: '0:15' },
    { label: '30m', value: '0:30' },
    { label: '1h', value: '1:00' },
    { label: '2h', value: '2:00' },
  ];

  projects: ProjectOption[] = [];
  /** Company options per project, loaded on demand. Each entry can be on a different project. */
  companiesByProject: { [projectId: number]: CompanyOption[] } = {};
  loadingCompanies = new Set<number>();

  @ViewChildren('entryCard') entryCards!: QueryList<ElementRef<HTMLElement>>;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private timesheetService: TimesheetService,
    private dialogRef: MatDialogRef<TimesheetFormComponent, TimesheetFormResult>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<ITimesheet> | null
  ) {
    this.isEditMode = !!data?.id;
    this.form = this.fb.group({
      date: [data?.date ? moment(data.date, 'YYYY-MM-DD').toDate() : moment().startOf('day').toDate(), Validators.required],
      entries: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.addEntry(this.isEditMode ? this.data! : undefined);
    this.loadLookups();

    // Ask before throwing away unsaved entries
    this.dialogRef.disableClose = true;
    this.dialogRef.backdropClick().pipe(takeUntil(this.destroy$)).subscribe(() => this.close());
    this.dialogRef.keydownEvents().pipe(takeUntil(this.destroy$)).subscribe(e => {
      if (e.key === 'Escape') this.close();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ---------------------------------------------------------------------
  // Entries
  // ---------------------------------------------------------------------

  get entries(): FormArray {
    return this.form.get('entries') as FormArray;
  }

  entryGroup(i: number): FormGroup {
    return this.entries.at(i) as FormGroup;
  }

  addEntry(source?: Partial<ITimesheet>, copyFromPrevious = false): void {
    const previous = copyFromPrevious && this.entries.length
      ? this.entries.at(this.entries.length - 1).value
      : null;

    const group = this.fb.group({
      project_id: [source?.project_id ?? previous?.project_id ?? null, Validators.required],
      company_id: [source?.company_id ?? previous?.company_id ?? null, Validators.required],
      activity_id: [toId(source?.activity_id ?? previous?.activity_id)],
      work_type_id: [toId(source?.work_type_id ?? previous?.work_type_id), Validators.required],
      duration: [source?.duration ? DurationUtil.toInput(source.duration) : '', DurationUtil.validator],
      comment: [source?.comment && source.comment !== '0' ? source.comment : '']
    });
    this.entries.push(group);

    const projectId = group.value.project_id;
    if (projectId) this.loadCompanies(projectId);

    if (copyFromPrevious) {
      // Bring the new card into view and focus its duration, the field most likely to change
      setTimeout(() => {
        const card = this.entryCards?.last?.nativeElement;
        card?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        card?.querySelector<HTMLInputElement>('input[formControlName="duration"]')?.focus();
      });
    }
  }

  removeEntry(i: number): void {
    this.entries.removeAt(i);
    this.form.markAsDirty();
  }

  onProjectChange(i: number, projectId: number): void {
    this.entryGroup(i).patchValue({ company_id: null });
    this.loadCompanies(projectId);
  }

  setDuration(i: number, value: string): void {
    const control = this.entryGroup(i).get('duration')!;
    control.setValue(value);
    control.markAsTouched();
    this.form.markAsDirty();
  }

  /** Normalises e.g. "1.5" to "1:30" when the field loses focus. */
  tidyDuration(i: number): void {
    const control = this.entryGroup(i).get('duration')!;
    const seconds = DurationUtil.parse(control.value);
    if (seconds && control.valid) {
      control.setValue(DurationUtil.toInput(DurationUtil.toHms(seconds)), { emitEvent: false });
    }
  }

  durationLabel(i: number): string {
    const seconds = DurationUtil.parse(this.entryGroup(i).get('duration')!.value);
    return seconds ? DurationUtil.toLabel(seconds) : '';
  }

  durationError(control: AbstractControl | null): string {
    if (!control?.errors) return '';
    if (control.errors['required']) return 'Duration is required';
    if (control.errors['durationFormat']) return 'Use 1:30, 1.5 or 45m';
    if (control.errors['durationZero']) return 'Must be more than 0';
    if (control.errors['durationMax']) return 'Cannot be more than 24 hours';
    return '';
  }

  get totalLabel(): string {
    const total = this.entries.controls.reduce((sum, c) => sum + (DurationUtil.parse(c.value.duration) ?? 0), 0);
    return DurationUtil.toLabel(total);
  }

  // ---------------------------------------------------------------------
  // Date
  // ---------------------------------------------------------------------

  setDate(daysAgo: number): void {
    this.form.patchValue({ date: moment().subtract(daysAgo, 'days').startOf('day').toDate() });
    this.form.markAsDirty();
  }

  isDate(daysAgo: number): boolean {
    const date = this.form.value.date;
    return !!date && moment(date).isSame(moment().subtract(daysAgo, 'days'), 'day');
  }

  // ---------------------------------------------------------------------
  // Lookups
  // ---------------------------------------------------------------------

  private loadLookups(): void {
    forkJoin({
      projects: this.timesheetService.getProjects(),
      activities: this.timesheetService.getActivities(),
      workTypes: this.timesheetService.getWorkTypes()
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ projects, activities, workTypes }) => {
        this.projects = projects.data;
        this.activities = activities.data;
        this.workTypes = workTypes.data;
      },
      error: () => this.error = 'Could not load the form options. Close the panel and try again.'
    });
  }

  /**
   * Active options, plus the entry's current value if it has since been archived,
   * so editing an old entry doesn't silently blank the field.
   */
  optionsFor(list: ITimesheetLookup[], selectedId: number | null): ITimesheetLookup[] {
    return list.filter(o => o.is_active || o.id === selectedId);
  }

  private loadCompanies(projectId: number): void {
    if (this.companiesByProject[projectId] || this.loadingCompanies.has(projectId)) return;

    this.loadingCompanies.add(projectId);
    this.timesheetService.getCompanies(projectId).pipe(takeUntil(this.destroy$)).subscribe({
      next: resp => {
        this.companiesByProject[projectId] = resp.data;
        this.loadingCompanies.delete(projectId);
      },
      error: () => {
        this.loadingCompanies.delete(projectId);
        this.error = 'Could not load companies for the selected project.';
      }
    });
  }

  companiesFor(i: number): CompanyOption[] {
    const projectId = this.entryGroup(i).value.project_id;
    return projectId ? this.companiesByProject[projectId] ?? [] : [];
  }

  trackByIndex(i: number): number {
    return i;
  }

  // ---------------------------------------------------------------------
  // Save / close
  // ---------------------------------------------------------------------

  submit(): void {
    if (this.saving) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Some entries are incomplete. Check the highlighted fields.';
      return;
    }

    const date = moment(this.form.value.date).format('YYYY-MM-DD');
    const payload: ITimesheet[] = this.entries.controls.map(c => ({
      date,
      project_id: c.value.project_id,
      company_id: c.value.company_id,
      activity_id: c.value.activity_id,
      work_type_id: c.value.work_type_id,
      duration: DurationUtil.toHms(DurationUtil.parse(c.value.duration)!),
      comment: (c.value.comment ?? '').trim()
    } as ITimesheet));

    this.saving = true;
    this.error = '';

    const request = this.isEditMode
      ? this.timesheetService.update(this.data!.id!, payload[0])
      : this.timesheetService.create(payload);

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.dialogRef.close({ saved: payload.length, updated: this.isEditMode }),
      error: err => {
        this.saving = false;
        this.error = err?.error?.message || 'Could not save. Please try again.';
      }
    });
  }

  close(): void {
    if (this.saving) return;
    if (this.form.dirty && !this.confirmDiscard) {
      this.confirmDiscard = true;
      return;
    }
    this.dialogRef.close();
  }
}
