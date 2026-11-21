import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ICompanyReportFilters, ICompanyReportRow, IResponseModelBase, ITimesheet, ITimesheetLookup } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {

  constructor(private http: HttpClient) { }

  getTimesheet(form: any) : Observable<IResponseModelBase<any>> {
    let url = 'api/timesheet';
    let params = [];

    // check applied filters and build url
    if (form.user_id) {
      params.push('user_id=' + form.user_id);
    }

    if (form.company_id) {
      params.push('company_id=' + form.company_id);
    }

    if (form.start_date && form.end_date) {
      params.push('start_date=' + form.start_date + '&end_date=' + form.end_date);
    }

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<IResponseModelBase<any>>(url);
  }

  /** Collective time, one row per project x company x employee. Admin only. */
  getCompanyTimeReport(filters: ICompanyReportFilters): Observable<IResponseModelBase<ICompanyReportRow[]>> {
    let params = new HttpParams()
      .set('start_date', filters.start_date)
      .set('end_date', filters.end_date);

    for (const key of ['project_id', 'company_id', 'user_id'] as const) {
      const value = filters[key];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    }

    return this.http.get<IResponseModelBase<ICompanyReportRow[]>>('api/timesheet/company-report', { params });
  }

  create(data: ITimesheet[]) : Observable<IResponseModelBase<ITimesheet[]>> {
    return this.http.post<IResponseModelBase<ITimesheet[]>>('api/timesheet', data);
  }

  delete(id: number) : Observable<any> {
    return this.http.delete(`api/timesheet/${id}`);
  }

  update(id: number, data: ITimesheet) : Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>(`api/timesheet/${id}`, data);
  }

  /** All activities, including archived ones (needed to display existing entries). */
  getActivities(): Observable<IResponseModelBase<ITimesheetLookup[]>> {
    return this.http.get<IResponseModelBase<ITimesheetLookup[]>>('api/timesheet/activities');
  }

  /** All work types, including archived ones (needed to display existing entries). */
  getWorkTypes(): Observable<IResponseModelBase<ITimesheetLookup[]>> {
    return this.http.get<IResponseModelBase<ITimesheetLookup[]>>('api/timesheet/work-types');
  }

  getProjects() : Observable<IResponseModelBase<any>> {
    return this.http.get<IResponseModelBase<any>>('api/timesheet/projects');
  }

  getCompanies(id: number) : Observable<IResponseModelBase<any>> {
    return this.http.get<IResponseModelBase<any>>(`api/timesheet/companies/${id}`);
  }

  getAllCompanies(): Observable<IResponseModelBase<any>> {
    return this.http.get<IResponseModelBase<any>>('api/timesheet/companies');
  }
}
