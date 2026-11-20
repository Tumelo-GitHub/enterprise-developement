import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  IResponseModelBase,
  ITimesheetCompany,
  ITimesheetCompanyStatus,
  ITimesheetLookup,
  ITimesheetProject,
  ITimesheetProjectCompany
} from 'src/app/shared';

export type TimesheetLookupKind = 'activities' | 'work-types';

/**
 * Admin-only management of timesheet projects, companies and project membership.
 * Backend: TimesheetAdmin controller, protected by the 'admin' filter.
 */
@Injectable({
  providedIn: 'root'
})
export class TimesheetAdminService {
  private readonly base = 'api/timesheet-admin';

  constructor(private http: HttpClient) { }

  getStatuses(): Observable<IResponseModelBase<ITimesheetCompanyStatus[]>> {
    return this.http.get<IResponseModelBase<ITimesheetCompanyStatus[]>>(`${this.base}/statuses`);
  }

  // Projects
  getProjects(): Observable<IResponseModelBase<ITimesheetProject[]>> {
    return this.http.get<IResponseModelBase<ITimesheetProject[]>>(`${this.base}/projects`);
  }

  createProject(project_name: string): Observable<IResponseModelBase<ITimesheetProject>> {
    return this.http.post<IResponseModelBase<ITimesheetProject>>(`${this.base}/projects`, { project_name });
  }

  updateProject(id: number, project_name: string): Observable<IResponseModelBase<ITimesheetProject>> {
    return this.http.post<IResponseModelBase<ITimesheetProject>>(`${this.base}/projects/${id}`, { project_name });
  }

  deleteProject(id: number): Observable<IResponseModelBase<null>> {
    return this.http.delete<IResponseModelBase<null>>(`${this.base}/projects/${id}`);
  }

  // Companies within a project
  getProjectCompanies(projectId: number): Observable<IResponseModelBase<ITimesheetProjectCompany[]>> {
    return this.http.get<IResponseModelBase<ITimesheetProjectCompany[]>>(`${this.base}/projects/${projectId}/companies`);
  }

  /** Returns the project's full, updated company list. */
  addProjectCompanies(projectId: number, company_ids: number[], status?: number): Observable<IResponseModelBase<ITimesheetProjectCompany[]>> {
    return this.http.post<IResponseModelBase<ITimesheetProjectCompany[]>>(`${this.base}/projects/${projectId}/companies`, { company_ids, status });
  }

  updateProjectCompanyStatus(id: number, status: number): Observable<IResponseModelBase<ITimesheetProjectCompany>> {
    return this.http.post<IResponseModelBase<ITimesheetProjectCompany>>(`${this.base}/project-companies/${id}`, { status });
  }

  removeProjectCompany(id: number): Observable<IResponseModelBase<null>> {
    return this.http.delete<IResponseModelBase<null>>(`${this.base}/project-companies/${id}`);
  }

  // Companies
  getCompanies(): Observable<IResponseModelBase<ITimesheetCompany[]>> {
    return this.http.get<IResponseModelBase<ITimesheetCompany[]>>(`${this.base}/companies`);
  }

  createCompany(company_name: string): Observable<IResponseModelBase<ITimesheetCompany>> {
    return this.http.post<IResponseModelBase<ITimesheetCompany>>(`${this.base}/companies`, { company_name });
  }

  updateCompany(id: number, company_name: string): Observable<IResponseModelBase<ITimesheetCompany>> {
    return this.http.post<IResponseModelBase<ITimesheetCompany>>(`${this.base}/companies/${id}`, { company_name });
  }

  deleteCompany(id: number): Observable<IResponseModelBase<null>> {
    return this.http.delete<IResponseModelBase<null>>(`${this.base}/companies/${id}`);
  }

  // Activities & work types
  getLookups(kind: TimesheetLookupKind): Observable<IResponseModelBase<ITimesheetLookup[]>> {
    return this.http.get<IResponseModelBase<ITimesheetLookup[]>>(`${this.base}/${kind}`);
  }

  createLookup(kind: TimesheetLookupKind, name: string): Observable<IResponseModelBase<ITimesheetLookup>> {
    return this.http.post<IResponseModelBase<ITimesheetLookup>>(`${this.base}/${kind}`, { name });
  }

  /** Rename and/or archive (is_active false) / restore. */
  updateLookup(kind: TimesheetLookupKind, id: number, changes: { name?: string, is_active?: boolean }): Observable<IResponseModelBase<ITimesheetLookup>> {
    return this.http.post<IResponseModelBase<ITimesheetLookup>>(`${this.base}/${kind}/${id}`, changes);
  }

  deleteLookup(kind: TimesheetLookupKind, id: number): Observable<IResponseModelBase<null>> {
    return this.http.delete<IResponseModelBase<null>>(`${this.base}/${kind}/${id}`);
  }

  /** Pulls the backend's `message` out of an HttpErrorResponse, falling back to a generic one. */
  static errorMessage(err: any, fallback: string): string {
    return err?.error?.message || err?.error?.error || fallback;
  }
}
