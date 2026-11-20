import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { IResponseModelBase, ITimesheet, ITimesheetLookup } from 'src/app/shared';

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

  getCompanyTimeReport(companyId: number | null, startDate: string, endDate: string, userId: number | null = null): Observable<IResponseModelBase<any[]>> {
    let params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);

    if (userId !== null) {
      params = params.set('user_id', userId.toString());
    }

    if (companyId !== null) {
      params = params.set('company_id', companyId.toString());
    }

    return this.http.get<IResponseModelBase<any[]>>('api/timesheet/company-report', { params });
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
