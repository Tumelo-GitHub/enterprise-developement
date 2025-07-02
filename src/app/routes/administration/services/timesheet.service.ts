import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResponseModelBase, ITimesheet } from 'src/app/shared';

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

    if (form.start_date && form.end_date) {
      params.push('start_date=' + form.start_date + '&end_date=' + form.end_date);
    }

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<IResponseModelBase<any>>(url);
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

  getProjects() : Observable<IResponseModelBase<any>> {
    return this.http.get<IResponseModelBase<any>>('api/timesheet/projects');
  }

  getCompanies(id: number) : Observable<IResponseModelBase<any>> {
    return this.http.get<IResponseModelBase<any>>(`api/timesheet/companies/${id}`);
  }
}
