import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResponseModelBase, IServiceProvider } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class ServiceProviderService {

  constructor(private http: HttpClient) { }

  getServiceProviderList() : Observable<IResponseModelBase<IServiceProvider[]>> {
    return this.http.get<IResponseModelBase<IServiceProvider[]>>(`api/service-provider`);
  }

  delete(id: number) : Observable<any> {
    return this.http.delete(`api/service-provider/${id}`);
  }

  create(data: any): Observable<IResponseModelBase<IServiceProvider>> {
    return this.http.post<IResponseModelBase<IServiceProvider>>(`api/service-provider`, data);
  }

  update(id: number, data: any) : Observable<IResponseModelBase<IServiceProvider>> {
    return this.http.post<IResponseModelBase<IServiceProvider>>(`api/service-provider/${id}`, data)
  }

  getServiceProviderByRole (id: number) : Observable<IResponseModelBase<any[]>> {
    return this.http.get<IResponseModelBase<any[]>>(`api/service-provider/role/${id}`);
  }
}
