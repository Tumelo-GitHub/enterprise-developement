import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IProgramme, IResponseModelBase } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class ProgrammeService {

  constructor(private http: HttpClient) { }

  getProgrammes() : Observable<IResponseModelBase<IProgramme[]>> {
    return this.http.get<IResponseModelBase<IProgramme[]>>(`api/programme`);
  }

  delete(id: number) : Observable<any> {
    return this.http.delete(`api/programme/${id}`);
  }

  create(data: any): Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>(`api/programme`, data);
  }

  update(id: number, data: any) : Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>(`api/programme/${id}`, data)
  }

  getProgrammeTypes() : Observable<IResponseModelBase<any>> {
    return this.http.get<IResponseModelBase<any>>('api/programme-types');
  }

  getAppointedBeneficiaries(id: number) : Observable<any> {
    return this.http.get(`api/appoint/smme/${id}`);
  }

  appointBeneficiaries(data : any) : Observable<any> {
    return this.http.post(`api/appoint/smme`, data);
  }

  deleteAppointment(id: number) : Observable<any> {
    return this.http.delete(`api/appoint/smme/${id}`);
  }
}
