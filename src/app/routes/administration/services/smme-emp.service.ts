import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SmmeEmpService {

  constructor(private http: HttpClient) { }

  getEmpByCompany(id: number) : Observable<any> {
    return this.http.get<any>(`api/smmeemp/${id}`)
  }

  delete(id: number) : Observable<any> {
    return this.http.delete(`api/smmeemp/${id}`);
  }

  update(id: number, data: any) : Observable<any> {
    console.log(data);
    return this.http.post<any>(`api/smmeemp/${id}`, data);
  }

  create(data: any) {
    return this.http.post<any>('api/smmeemp', data)
  }
}
