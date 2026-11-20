import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResponseModelBase } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class TrainingEventService {

  constructor(private http: HttpClient) { }

  getTrainingEvents() : Observable<IResponseModelBase<any>> {
    return this.http.get<IResponseModelBase<any>>('api/training/event');
  }

  getTrainingEvent(id: number) : Observable<IResponseModelBase<any>> {
    return this.http.get<IResponseModelBase<any>>(`api/training/event/${id}`);
  }

  create(data: any) : Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>('api/training/event', data);
  }

  update(id: number, data: any) : Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>(`api/training/event/${id}`, data)
  }

  delete(id: number) : Observable<any> {
    return this.http.delete(`api/training/event/${id}`);
  }

  getTrainingVenue () : Observable<IResponseModelBase<any>> {
    return this.http.get<IResponseModelBase<any>>('api/training/venue');
  }
}
