import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResponseModelBase, IEmployee } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class BdspEmpService {

  constructor(private http: HttpClient) { }

  getEmpByCompany(id: number) : Observable<IResponseModelBase<IEmployee[]>> {
    return this.http.get<IResponseModelBase<IEmployee[]>>(`api/bdspemp/${id}`)
  }

  delete(id: number) : Observable<any> {
    return this.http.delete(`api/smmeemp/${id}`);
  }

  update(id: number, data: any) : Observable<IResponseModelBase<IEmployee>> {
    return this.http.post<IResponseModelBase<IEmployee>>(`api/bdspemp/${id}`, data);
  }

  create(data: any) : Observable<IResponseModelBase<IEmployee>> {
    return this.http.post<IResponseModelBase<IEmployee>>('api/bdspemp', data)
  }
}
