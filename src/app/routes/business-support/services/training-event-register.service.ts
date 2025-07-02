import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResponseModelBase } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class TrainingEventRegisterService {

  constructor(private http: HttpClient) { }

  getTrainingRegister (event_ids: number[]) : Observable<IResponseModelBase<any>> {
    const params = new HttpParams().set('event_ids', event_ids.join(','));
    return this.http.get<IResponseModelBase<any>>(`api/training/register`, { params });
  }

  create(data: any) : Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>('api/training/register', data);
  }

  update(id: number, data: any) : Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>(`api/training/register/${id}`, data)
  }

  delete(id: number) : Observable<any> {
    return this.http.delete(`api/training/register/${id}`);
  }
}
