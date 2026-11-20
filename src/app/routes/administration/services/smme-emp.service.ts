import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResponseModelBase, IEmployee } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class SmmeEmpService {

  constructor(private http: HttpClient) { }

  getEmpByCompany(id: number) : Observable<IResponseModelBase<IEmployee[]>> {
    return this.http.get<IResponseModelBase<IEmployee[]>>(`api/smmeemp/${id}`)
  }

  getEmployeeById(id: number) : Observable<IResponseModelBase<IEmployee>> {
    return this.http.get<IResponseModelBase<IEmployee>>(`api/smmeemp/employee/${id}`);
  }

  delete(id: number) : Observable<any> {
    return this.http.delete(`api/smmeemp/${id}`);
  }

  update(id: number, data: any) : Observable<IResponseModelBase<IEmployee>> {
    console.log(data);
    return this.http.post<IResponseModelBase<IEmployee>>(`api/smmeemp/${id}`, data);
  }

  create(data: any) : Observable<IResponseModelBase<IEmployee>> {
    return this.http.post<IResponseModelBase<IEmployee>>('api/smmeemp', data)
  }
}
