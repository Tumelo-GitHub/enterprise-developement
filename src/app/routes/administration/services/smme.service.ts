import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResponseModelBase } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class SmmeService {

  constructor(private http: HttpClient) { }

  deleteCompany(id: number) : Observable<any> {
    return this.http.delete(`api/smme/${id}`);
  }

  getSmme() : Observable<IResponseModelBase<any>> {
    return this.http.get<IResponseModelBase<any>>("api/smme");
  }

  create(data: any) : Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>('api/smme', data)
  }

  getCompanyById(id: number) : Observable<IResponseModelBase<any>> {
    return this.http.get<IResponseModelBase<any>>(`api/smme/${id}`)
  }

  update(id: number, data: any) : Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>(`api/smme/${id}`, data);
  }
}
