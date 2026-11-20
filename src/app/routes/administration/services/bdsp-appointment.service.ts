import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResponseModelBase } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class BdspAppointmentService {

  constructor(private http: HttpClient) { }

  getAppointedBSDP (id: number) : Observable<IResponseModelBase<any>> {
    return this.http.get<IResponseModelBase<any>>(`api/appoint/bdsp/${id}`);
  }

  getAppointmentById(appointmentId: number) : Observable<IResponseModelBase<any>> {
    return this.http.get<IResponseModelBase<any>>(`api/appoint/bdsp/detail/${appointmentId}`);
  }

  create(data: any) : Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>('api/appoint/bdsp', data);
  }

  update(id: number, data: any) : Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>(`api/appoint/bdsp/${id}`, data)
  }

  delete(id: number) : Observable<any> {
    return this.http.delete(`api/appoint/bdsp/${id}`);
  }
}
