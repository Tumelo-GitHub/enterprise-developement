import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResponseModelBase } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class TrainingEventRegisterService {

  constructor(private http: HttpClient) { }

  getTrainingRegister (event_id: number) : Observable<IResponseModelBase<any>> {
    return this.http.get<IResponseModelBase<any>>(`api/training/register/${event_id}`);
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
