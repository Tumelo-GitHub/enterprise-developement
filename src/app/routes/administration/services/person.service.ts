import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPerson, IResponseModelBase } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class PersonService {

  constructor(private http: HttpClient) { }

  getPersonList() : Observable<IResponseModelBase<IPerson[]>> {
    return this.http.get<IResponseModelBase<IPerson[]>>('api/course');
  }

  add(data: any) : Observable<IResponseModelBase<IPerson>> {
    return this.http.post<IResponseModelBase<IPerson>>('api/course', data);
  }

  update(id: number, data: any) : Observable<IResponseModelBase<IPerson>> {
    return this.http.post<IResponseModelBase<IPerson>>(`api/course/${id}`, data)
  }

  delete(id: number) : Observable<any> {
    return this.http.delete(`api/course/${id}`);
  }
}
