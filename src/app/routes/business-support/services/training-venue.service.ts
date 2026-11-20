import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ITrainingVenue, IResponseModelBase } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class TrainingVenueService {

  constructor(private http: HttpClient) { }

  getTrainingVenueList(): Observable<IResponseModelBase<ITrainingVenue[]>> {
    return this.http.get<IResponseModelBase<ITrainingVenue[]>>('api/training-venue');
  }

  add(data: any): Observable<IResponseModelBase<ITrainingVenue>> {
    return this.http.post<IResponseModelBase<ITrainingVenue>>('api/training-venue', data);
  }

  update(id: number, data: any): Observable<IResponseModelBase<ITrainingVenue>> {
    return this.http.post<IResponseModelBase<ITrainingVenue>>(`api/training-venue/${id}`, data)
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`api/training-venue/${id}`);
  }
}