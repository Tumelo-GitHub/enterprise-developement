import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResponseModelBase } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class GenericCompanyService {

  constructor(private http: HttpClient) { }

  getCompanyList() : Observable<IResponseModelBase<any>> {
    return this.http.get<IResponseModelBase<any>>('api/generic-company');
  }

  add(data: any) : Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>('api/generic-company', data);
  }

  update(id: number, data: any) : Observable<IResponseModelBase<any>> {
    return this.http.put<IResponseModelBase<any>>(`api/generic/${id}`, data)
  }

  delete(id: number) : Observable<any> {
    return this.http.delete(`api/generic/${id}`);
  }
}
