import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import {
  ITimesheetCompany,
  ITimesheetCompanyStatus,
  ITimesheetProject,
  ITimesheetProjectCompany
} from 'src/app/shared';
import { ToastService } from 'src/app/shared/services/toast.service';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';
import { TimesheetAdminService } from '../services/timesheet-admin.service';
import { TimesheetNameDialogComponent, TimesheetNameDialogData } from './name-dialog/timesheet-name-dialog.component';
import {
  TimesheetAddCompaniesDialogComponent,
  TimesheetAddCompaniesDialogData,
  TimesheetAddCompaniesDialogResult
} from './add-companies-dialog/timesheet-add-companies-dialog.component';

/**
 * Admin page for timesheet setup:
 *  - Projects tab: list of projects (left) and the companies within the selected project (right)
 *  - Companies tab: master list of all timesheet companies
 *
 * Route is protected by AdminGuard. The API is protected by the backend 'admin' filter.
 */
@Component({
  selector: 'app-timesheet-manager',
  templateUrl: './timesheet-manager.component.html',
  styleUrls: ['./timesheet-manager.component.scss']
})
export class TimesheetManagerComponent implements OnInit, OnDestroy {
  loading = true;
  loadError = false;

  statuses: ITimesheetCompanyStatus[] = [];

  // Projects (left panel)
  projects: ITimesheetProject[] = [];
  projectSearch = '';
  selectedProject: ITimesheetProject | null = null;

  // Companies within selected project (right panel)
  projectCompanyColumns = ['company_name', 'status', 'entry_count', 'actions'];
  projectCompanyData = new MatTableDataSource<ITimesheetProjectCompany>([]);
  projectCompaniesLoading = false;
  /** Rows whose status change is in flight, so the select can be disabled. */
  savingStatusIds = new Set<number>();

  // All companies (Companies tab)
  companyColumns = ['company_name', 'project_names', 'entry_count', 'actions'];
  companyData = new MatTableDataSource<ITimesheetCompany>([]);

  private destroy$ = new Subject<void>();

  // Tables are inside *ngIf / tabs, so attach paginator & sort whenever they appear.
  @ViewChild('pcPaginator') set pcPaginator(p: MatPaginator) { if (p) this.projectCompanyData.paginator = p; }
  @ViewChild('pcSort') set pcSort(s: MatSort) { if (s) this.projectCompanyData.sort = s; }
  @ViewChild('companyPaginator') set companyPaginator(p: MatPaginator) { if (p) this.companyData.paginator = p; }
  @ViewChild('companySort') set companySort(s: MatSort) { if (s) this.companyData.sort = s; }

  constructor(
    private service: TimesheetAdminService,
    private dialog: MatDialog,
    private toast: ToastService,
    private notify: NotificationUtil
  ) {
    this.projectCompanyData.filterPredicate = (row, filter) =>
      `${row.company_name} ${row.status ?? ''}`.toLowerCase().includes(filter);
    this.companyData.filterPredicate = (row, filter) =>
      `${row.company_name} ${row.project_names ?? ''}`.toLowerCase().includes(filter);
  }

  ngOnInit(): void {
    this.loadAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ---------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------

  loadAll(): void {
    this.loading = true;
    this.loadError = false;
    forkJoin({
      statuses: this.service.getStatuses(),
      projects: this.service.getProjects(),
      companies: this.service.getCompanies()
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ statuses, projects, companies }) => {
        this.statuses = statuses.data;
        this.companyData.data = companies.data;
        this.setProjects(projects.data);
        this.loading = false;
        if (!this.selectedProject && this.projects.length) {
          this.selectProject(this.projects[0]);
        }
      },
      error: err => {
        this.loading = false;
        this.loadError = true;
        this.notify.showError(TimesheetAdminService.errorMessage(err, 'Failed to load timesheet setup'));
      }
    });
  }

  /** Reloads projects (for updated counts) while keeping the current selection. */
  private reloadProjects(): void {
    this.service.getProjects().pipe(takeUntil(this.destroy$)).subscribe({
      next: resp => this.setProjects(resp.data),
      error: err => console.error('Error reloading projects:', err)
    });
  }

  private reloadCompanies(): void {
    this.service.getCompanies().pipe(takeUntil(this.destroy$)).subscribe({
      next: resp => this.companyData.data = resp.data,
      error: err => console.error('Error reloading companies:', err)
    });
  }

  private setProjects(projects: ITimesheetProject[]): void {
    this.projects = projects;
    if (this.selectedProject) {
      this.selectedProject = projects.find(p => p.id === this.selectedProject!.id) ?? null;
      if (!this.selectedProject) this.projectCompanyData.data = [];
    }
  }

  // ---------------------------------------------------------------------
  // Projects
  // ---------------------------------------------------------------------

  get filteredProjects(): ITimesheetProject[] {
    const term = this.projectSearch.trim().toLowerCase();
    return term ? this.projects.filter(p => p.project_name.toLowerCase().includes(term)) : this.projects;
  }

  selectProject(project: ITimesheetProject): void {
    if (this.selectedProject?.id === project.id && this.projectCompanyData.data.length) return;

    this.selectedProject = project;
    this.projectCompanyData.data = [];
    this.projectCompanyData.filter = '';
    this.projectCompaniesLoading = true;

    this.service.getProjectCompanies(project.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: resp => {
        // Ignore stale responses if the user clicked another project meanwhile
        if (this.selectedProject?.id !== project.id) return;
        this.projectCompanyData.data = resp.data;
        this.projectCompaniesLoading = false;
      },
      error: err => {
        this.projectCompaniesLoading = false;
        this.notify.showError(TimesheetAdminService.errorMessage(err, 'Failed to load project companies'));
      }
    });
  }

  openProjectDialog(project?: ITimesheetProject): void {
    const data: TimesheetNameDialogData = {
      title: project ? 'Rename project' : 'New project',
      label: 'Project name',
      value: project?.project_name,
      save: name => project
        ? this.service.updateProject(project.id, name)
        : this.service.createProject(name)
    };

    this.dialog.open(TimesheetNameDialogComponent, { data, width: '440px' })
      .afterClosed().subscribe((saved?: ITimesheetProject) => {
        if (!saved) return;
        this.notify.showSuccess(project ? 'Project renamed' : 'Project created');
        if (project) {
          this.setProjects(this.projects.map(p => p.id === saved.id ? saved : p));
          this.reloadCompanies(); // project names appear in the Companies tab
        } else {
          this.setProjects([...this.projects, saved].sort((a, b) => a.project_name.localeCompare(b.project_name)));
          this.selectProject(saved);
        }
      });
  }

  deleteProject(project: ITimesheetProject): void {
    this.toast.openConfirmBox('danger', 'Delete project',
      `Delete "${project.project_name}"? Its ${project.company_count} company link(s) will also be removed.`
    ).subscribe(resp => {
      if (!resp.success) return;
      this.service.deleteProject(project.id).subscribe({
        next: () => {
          this.notify.showSuccess('Project deleted');
          this.setProjects(this.projects.filter(p => p.id !== project.id));
          if (!this.selectedProject && this.projects.length) this.selectProject(this.projects[0]);
          this.reloadCompanies();
        },
        error: err => this.notify.showError(TimesheetAdminService.errorMessage(err, 'Failed to delete project'))
      });
    });
  }

  // ---------------------------------------------------------------------
  // Companies within the selected project
  // ---------------------------------------------------------------------

  applyProjectCompanyFilter(event: Event): void {
    this.projectCompanyData.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.projectCompanyData.paginator?.firstPage();
  }

  openAddCompaniesDialog(): void {
    if (!this.selectedProject) return;
    const project = this.selectedProject;

    const data: TimesheetAddCompaniesDialogData = {
      project,
      companies: this.companyData.data,
      linkedCompanyIds: this.projectCompanyData.data.map(pc => pc.company_id),
      statuses: this.statuses
    };

    this.dialog.open<TimesheetAddCompaniesDialogComponent, TimesheetAddCompaniesDialogData, TimesheetAddCompaniesDialogResult>(
      TimesheetAddCompaniesDialogComponent, { data, maxWidth: '95vw' }
    ).afterClosed().subscribe(result => {
      // A company may have been created inside the dialog even if it was cancelled
      this.reloadCompanies();
      if (!result) return;
      if (this.selectedProject?.id === project.id) {
        this.projectCompanyData.data = result.projectCompanies;
      }
      this.notify.showSuccess(result.message);
      this.reloadProjects();
    });
  }

  changeStatus(row: ITimesheetProjectCompany, event: MatSelectChange): void {
    const next = event.value as number;
    this.savingStatusIds.add(row.id);

    this.service.updateProjectCompanyStatus(row.id, next).subscribe({
      next: resp => {
        this.savingStatusIds.delete(row.id);
        this.replaceProjectCompany(resp.data);
        this.notify.showSuccess(`${row.company_name} set to ${resp.data.status}`);
        this.reloadProjects();
      },
      error: err => {
        this.savingStatusIds.delete(row.id);
        // The select is one-way bound to row.status_id, which never changed. Swap in a copy
        // so the row re-renders and the select shows the original value again.
        this.projectCompanyData.data = this.projectCompanyData.data.map(pc => pc.id === row.id ? { ...pc } : pc);
        this.notify.showError(TimesheetAdminService.errorMessage(err, 'Failed to update status'));
      }
    });
  }

  removeFromProject(row: ITimesheetProjectCompany): void {
    this.toast.openConfirmBox('danger', 'Remove company',
      `Remove "${row.company_name}" from ${this.selectedProject?.project_name}?`
    ).subscribe(resp => {
      if (!resp.success) return;
      this.service.removeProjectCompany(row.id).subscribe({
        next: () => {
          this.notify.showSuccess('Company removed from project');
          this.projectCompanyData.data = this.projectCompanyData.data.filter(pc => pc.id !== row.id);
          this.reloadProjects();
          this.reloadCompanies();
        },
        error: err => this.notify.showError(TimesheetAdminService.errorMessage(err, 'Failed to remove company'))
      });
    });
  }

  private replaceProjectCompany(updated: ITimesheetProjectCompany | null): void {
    if (!updated) return;
    this.projectCompanyData.data = this.projectCompanyData.data.map(pc => pc.id === updated.id ? updated : pc);
  }

  isActive(row: ITimesheetProjectCompany): boolean {
    return row.status === 'Active';
  }

  // ---------------------------------------------------------------------
  // All companies (Companies tab)
  // ---------------------------------------------------------------------

  applyCompanyFilter(event: Event): void {
    this.companyData.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.companyData.paginator?.firstPage();
  }

  openCompanyDialog(company?: ITimesheetCompany): void {
    const data: TimesheetNameDialogData = {
      title: company ? 'Rename company' : 'New company',
      label: 'Company name',
      value: company?.company_name,
      save: name => company
        ? this.service.updateCompany(company.id, name)
        : this.service.createCompany(name)
    };

    this.dialog.open(TimesheetNameDialogComponent, { data, width: '440px' })
      .afterClosed().subscribe((saved?: ITimesheetCompany) => {
        if (!saved) return;
        this.notify.showSuccess(company ? 'Company renamed' : 'Company created');
        this.reloadCompanies();
        // Renames show up in the selected project's list too
        if (company && this.selectedProject) {
          this.projectCompanyData.data = this.projectCompanyData.data.map(pc =>
            pc.company_id === saved.id ? { ...pc, company_name: saved.company_name } : pc);
        }
      });
  }

  deleteCompany(company: ITimesheetCompany): void {
    const links = company.project_count
      ? ` It will also be removed from ${company.project_count} project(s).`
      : '';
    this.toast.openConfirmBox('danger', 'Delete company', `Delete "${company.company_name}"?${links}`)
      .subscribe(resp => {
        if (!resp.success) return;
        this.service.deleteCompany(company.id).subscribe({
          next: () => {
            this.notify.showSuccess('Company deleted');
            this.companyData.data = this.companyData.data.filter(c => c.id !== company.id);
            this.projectCompanyData.data = this.projectCompanyData.data.filter(pc => pc.company_id !== company.id);
            this.reloadProjects();
          },
          error: err => this.notify.showError(TimesheetAdminService.errorMessage(err, 'Failed to delete company'))
        });
      });
  }

  trackById(_: number, item: { id: number }): number {
    return item.id;
  }
}
