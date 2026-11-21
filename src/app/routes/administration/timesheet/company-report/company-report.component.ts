import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { ICompanyReportRow, IUser } from 'src/app/shared';
import { ToastService } from 'src/app/shared/services/toast.service';
import { DurationUtil } from 'src/app/shared/utils/duration.util';
import { TableUtil } from 'src/app/shared/utils/tableUtil';
import { TimesheetService } from '../../services/timesheet.service';
import { formatRange, Period, periodRange, PERIODS, toIsoDate } from '../timesheet-period';

interface PersonRow {
  user_id: number;
  name: string;
  initials: string;
  seconds: number;
  entries: number;
  lastDate: string;
  comments: string[];
}

interface CompanyRow {
  key: string;
  company_id: number;
  company_name: string;
  seconds: number;
  entries: number;
  lastDate: string;
  people: PersonRow[];
  commentCount: number;
}

interface ProjectGroup {
  project_id: number;
  project_name: string;
  seconds: number;
  entries: number;
  companies: CompanyRow[];
}

/**
 * Admin report: how much time the team collectively spent on each project › company,
 * and who contributed. One API row per project x company x employee, aggregated here.
 */
@Component({
  selector: 'app-company-report',
  templateUrl: './company-report.component.html',
  styleUrls: ['./company-report.component.scss']
})
export class CompanyReportComponent implements OnInit, OnDestroy {
  /** All timesheet companies (used when no project is selected). */
  @Input() companies: any[] = [];
  @Input() users: IUser[] = [];

  readonly periods = PERIODS;
  period: Period = 'this_month';

  form: FormGroup;
  customRange: FormGroup;
  search = '';

  projects: any[] = [];
  /** Companies in the selected project, so the Company filter only offers relevant ones. */
  projectCompanies: any[] | null = null;

  loading = false;
  rows: ICompanyReportRow[] = [];
  groups: ProjectGroup[] = [];
  expanded = new Set<string>();

  totalSeconds = 0;
  totalEntries = 0;
  companyCount = 0;
  projectCount = 0;
  peopleCount = 0;
  topCompany: { name: string, seconds: number } | null = null;

  private destroy$ = new Subject<void>();
  private request?: Subscription;

  constructor(
    private fb: FormBuilder,
    private timesheetService: TimesheetService,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      start_date: [null],
      end_date: [null],
      project_id: [null],
      company_id: [null],
      user_id: [null]
    });
    this.customRange = this.fb.group({ start: [null], end: [null] });
  }

  ngOnInit(): void {
    this.timesheetService.getProjects().pipe(takeUntil(this.destroy$)).subscribe({
      next: resp => this.projects = resp.data,
      error: err => console.error('Error loading projects:', err)
    });
    this.setPeriod('this_month');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ---------------------------------------------------------------------
  // Filters
  // ---------------------------------------------------------------------

  get companyOptions(): any[] {
    return this.projectCompanies ?? this.companies;
  }

  get periodLabel(): string {
    return formatRange(this.form.value.start_date, this.form.value.end_date);
  }

  setPeriod(period: Period): void {
    this.period = period;
    if (period === 'custom') {
      const { start_date, end_date } = this.form.value;
      this.customRange.setValue({
        start: start_date ? new Date(`${start_date}T00:00:00`) : null,
        end: end_date ? new Date(`${end_date}T00:00:00`) : null
      });
      return;
    }
    const { start, end } = periodRange(period);
    this.form.patchValue({ start_date: start, end_date: end });
    this.load();
  }

  onCustomRangeChange(): void {
    const { start, end } = this.customRange.value;
    if (!start || !end) return;
    this.form.patchValue({ start_date: toIsoDate(start), end_date: toIsoDate(end) });
    this.load();
  }

  onProjectChange(projectId: number | null): void {
    this.projectCompanies = null;
    if (!projectId) {
      this.load();
      return;
    }
    this.timesheetService.getCompanies(projectId).pipe(takeUntil(this.destroy$)).subscribe({
      next: resp => {
        this.projectCompanies = resp.data;
        // Drop a company filter that isn't part of the newly selected project
        const companyId = this.form.value.company_id;
        if (companyId && !resp.data.some((c: any) => String(c.id) === String(companyId))) {
          this.form.patchValue({ company_id: null });
        }
        this.load();
      },
      error: () => this.load()
    });
  }

  onSearch(value: string): void {
    this.search = value;
    this.rebuild();
  }

  get hasFilters(): boolean {
    const { project_id, company_id, user_id } = this.form.value;
    return !!(project_id || company_id || user_id || this.search);
  }

  clearFilters(): void {
    this.form.patchValue({ project_id: null, company_id: null, user_id: null });
    this.projectCompanies = null;
    this.search = '';
    this.load();
  }

  // ---------------------------------------------------------------------
  // Data
  // ---------------------------------------------------------------------

  load(): void {
    const { start_date, end_date, project_id, company_id, user_id } = this.form.value;
    if (!start_date || !end_date) return;

    this.request?.unsubscribe(); // newest filters win
    this.loading = true;
    this.request = this.timesheetService.getCompanyTimeReport({ start_date, end_date, project_id, company_id, user_id })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: resp => {
          this.rows = resp.data ?? [];
          this.rebuild();
          this.loading = false;
        },
        error: err => {
          console.error('Error fetching company timesheet report:', err);
          this.loading = false;
          this.toast.toastNotification('danger', 'Error', err?.error?.message || 'Failed to load the company report.');
        }
      });
  }

  private matchesSearch(row: ICompanyReportRow, term: string): boolean {
    return [row.project_name, row.company_name, `${row.first_name} ${row.last_name}`, ...row.comments]
      .some(v => (v ?? '').toLowerCase().includes(term));
  }

  /** Aggregates API rows into project › company › person, sorted by time spent. */
  private rebuild(): void {
    const term = this.search.trim().toLowerCase();
    const rows = term ? this.rows.filter(r => this.matchesSearch(r, term)) : this.rows;

    const projects = new Map<number, ProjectGroup>();
    const companyTotals = new Map<number, { name: string, seconds: number }>();
    const people = new Set<number>();

    for (const r of rows) {
      let project = projects.get(r.project_id);
      if (!project) {
        project = { project_id: r.project_id, project_name: r.project_name, seconds: 0, entries: 0, companies: [] };
        projects.set(r.project_id, project);
      }

      const key = `${r.project_id}-${r.company_id}`;
      let company = project.companies.find(c => c.key === key);
      if (!company) {
        company = { key, company_id: r.company_id, company_name: r.company_name, seconds: 0, entries: 0, lastDate: '', people: [], commentCount: 0 };
        project.companies.push(company);
      }

      const name = `${r.first_name ?? ''} ${r.last_name ?? ''}`.trim() || 'Unknown';
      company.people.push({
        user_id: r.user_id,
        name,
        initials: name.split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase(),
        seconds: r.total_seconds,
        entries: r.entry_count,
        lastDate: r.last_date,
        comments: r.comments
      });
      company.seconds += r.total_seconds;
      company.entries += r.entry_count;
      company.commentCount += r.comments.length;
      if (r.last_date > company.lastDate) company.lastDate = r.last_date;

      project.seconds += r.total_seconds;
      project.entries += r.entry_count;

      const total = companyTotals.get(r.company_id) ?? { name: r.company_name, seconds: 0 };
      total.seconds += r.total_seconds;
      companyTotals.set(r.company_id, total);
      people.add(r.user_id);
    }

    const bySeconds = <T extends { seconds: number }>(a: T, b: T) => b.seconds - a.seconds;
    this.groups = [...projects.values()].sort(bySeconds);
    for (const p of this.groups) {
      p.companies.sort(bySeconds);
      p.companies.forEach(c => c.people.sort(bySeconds));
    }

    this.totalSeconds = this.groups.reduce((s, p) => s + p.seconds, 0);
    this.totalEntries = this.groups.reduce((s, p) => s + p.entries, 0);
    this.projectCount = this.groups.length;
    this.companyCount = companyTotals.size;
    this.peopleCount = people.size;
    this.topCompany = [...companyTotals.values()].sort(bySeconds)[0] ?? null;
  }

  // ---------------------------------------------------------------------
  // Display helpers
  // ---------------------------------------------------------------------

  label(seconds: number): string {
    return DurationUtil.toLabel(seconds);
  }

  share(seconds: number, of: number = this.totalSeconds): number {
    return of ? Math.round((seconds / of) * 1000) / 10 : 0;
  }

  get averagePerPerson(): string {
    return this.peopleCount ? DurationUtil.toLabel(this.totalSeconds / this.peopleCount) : '0m';
  }

  toggle(key: string): void {
    this.expanded.has(key) ? this.expanded.delete(key) : this.expanded.add(key);
  }

  expandAll(expand: boolean): void {
    this.expanded = new Set(expand ? this.groups.flatMap(p => p.companies.map(c => c.key)) : []);
  }

  get allExpanded(): boolean {
    const total = this.groups.reduce((s, p) => s + p.companies.length, 0);
    return total > 0 && this.expanded.size === total;
  }

  trackProject(_: number, p: ProjectGroup): number { return p.project_id; }
  trackCompany(_: number, c: CompanyRow): string { return c.key; }
  trackPerson(_: number, p: PersonRow): number { return p.user_id; }

  // ---------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------

  private fileName(suffix = ''): string {
    return `Company report ${this.form.value.start_date} to ${this.form.value.end_date}${suffix}`;
  }

  private summaryRows() {
    return this.groups.flatMap(p => p.companies.map(c => ({
      Project: p.project_name,
      Company: c.company_name,
      'Total time': DurationUtil.toHms(c.seconds),
      Hours: Math.round(c.seconds / 36) / 100,
      People: c.people.map(x => x.name).join(', '),
      Entries: c.entries,
      Comments: c.people.flatMap(x => x.comments).join('; ')
    })));
  }

  private ensureData(): boolean {
    if (this.groups.length) return true;
    this.toast.toastNotification('warning', 'Nothing to export', 'There is no time for the selected filters.');
    return false;
  }

  exportExcel(): void {
    if (this.ensureData()) TableUtil.exportArrayToExcel(this.summaryRows(), this.fileName());
  }

  exportCSV(): void {
    if (this.ensureData()) TableUtil.exportArrayToCSV(this.summaryRows(), this.fileName());
  }

  /** One row per person per project › company. */
  exportDetailedExcel(): void {
    if (!this.ensureData()) return;
    TableUtil.exportArrayToExcel(this.groups.flatMap(p => p.companies.flatMap(c => c.people.map(person => ({
      Project: p.project_name,
      Company: c.company_name,
      Employee: person.name,
      'Total time': DurationUtil.toHms(person.seconds),
      Hours: Math.round(person.seconds / 36) / 100,
      Entries: person.entries,
      'Last entry': person.lastDate,
      Comments: person.comments.join('; ')
    })))), this.fileName(' by person'));
  }

  exportPDF(): void {
    if (!this.ensureData()) return;
    const rows: any[][] = this.summaryRows().map(r => [r.Project, r.Company, r['Total time'], r.People, r.Comments]);
    rows.push(['Total', '', DurationUtil.toHms(this.totalSeconds), `${this.peopleCount} people`, '']);
    TableUtil.exportArrayToPDF(
      ['Project', 'Company', 'Total time', 'People', 'Comments'],
      rows,
      this.fileName(),
      `Company timesheet report (${this.periodLabel})`
    );
  }
}
