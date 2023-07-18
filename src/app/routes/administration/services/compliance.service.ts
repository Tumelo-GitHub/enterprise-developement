import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComplianceService {

  constructor(private http: HttpClient) { }

  getComplienceListByCompany(id: number) : Observable<any> {
    return this.http.get<any>(`api/compliance/${id}`)
  }

  delete(id: number) : Observable<any> {
    return this.http.delete(`api/compliance/${id}`);
  }

  update(id: number, data: any) : Observable<any> {
    console.log(data);
    return this.http.post<any>(`api/compliance/${id}`, data);
  }

  create(data: any) {
    return this.http.post<any>('api/compliance', data)
  }
}
