import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  ITimesheetCompany,
  ITimesheetCompanyStatus,
  ITimesheetProject,
  ITimesheetProjectCompany
} from 'src/app/shared';
import { TimesheetAdminService } from '../../services/timesheet-admin.service';

export interface TimesheetAddCompaniesDialogData {
  project: ITimesheetProject;
  companies: ITimesheetCompany[];
  linkedCompanyIds: number[];
  statuses: ITimesheetCompanyStatus[];
}

export interface TimesheetAddCompaniesDialogResult {
  projectCompanies: ITimesheetProjectCompany[];
  message: string;
}

/**
 * Pick one or more companies (not yet in the project) to add to it.
 * A company that doesn't exist yet can be created inline and is selected automatically.
 * Closes with undefined when cancelled. The parent should reload companies either way,
 * since one may have been created before cancelling.
 */
@Component({
  selector: 'app-timesheet-add-companies-dialog',
  templateUrl: './timesheet-add-companies-dialog.component.html',
  styleUrls: ['./timesheet-add-companies-dialog.component.scss']
})
export class TimesheetAddCompaniesDialogComponent {
  available: ITimesheetCompany[];
  search = '';
  selectedIds = new Set<number>();
  status: number | null;

  newCompanyName = '';
  creating = false;

  saving = false;
  error = '';

  constructor(
    private service: TimesheetAdminService,
    private dialogRef: MatDialogRef<TimesheetAddCompaniesDialogComponent, TimesheetAddCompaniesDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: TimesheetAddCompaniesDialogData
  ) {
    const linked = new Set(data.linkedCompanyIds);
    this.available = data.companies.filter(c => !linked.has(c.id));
    const active = data.statuses.find(s => s.status === 'Active') ?? data.statuses[0];
    this.status = active ? active.id : null;
  }

  get filtered(): ITimesheetCompany[] {
    const term = this.search.trim().toLowerCase();
    return term
      ? this.available.filter(c => c.company_name.toLowerCase().includes(term))
      : this.available;
  }

  toggle(id: number, selected: boolean): void {
    selected ? this.selectedIds.add(id) : this.selectedIds.delete(id);
  }

  trackById(_: number, c: ITimesheetCompany): number {
    return c.id;
  }

  createCompany(): void {
    const name = this.newCompanyName.trim();
    if (!name || this.creating) return;

    this.creating = true;
    this.error = '';
    this.service.createCompany(name).subscribe({
      next: resp => {
        this.creating = false;
        this.newCompanyName = '';
        this.available = [...this.available, resp.data]
          .sort((a, b) => a.company_name.localeCompare(b.company_name));
        this.selectedIds.add(resp.data.id);
        this.search = '';
      },
      error: err => {
        this.creating = false;
        this.error = TimesheetAdminService.errorMessage(err, 'Could not create company.');
      }
    });
  }

  submit(): void {
    if (!this.selectedIds.size || this.saving) return;

    this.saving = true;
    this.error = '';
    this.service.addProjectCompanies(this.data.project.id, [...this.selectedIds], this.status ?? undefined).subscribe({
      next: resp => this.dialogRef.close({ projectCompanies: resp.data, message: resp.message }),
      error: err => {
        this.saving = false;
        this.error = TimesheetAdminService.errorMessage(err, 'Could not add companies.');
      }
    });
  }
}
