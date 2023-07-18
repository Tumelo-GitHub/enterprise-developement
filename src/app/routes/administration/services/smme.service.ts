import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SmmeService {

  constructor(private http: HttpClient) { }

  deleteCompany(id: number) : Observable<any> {
    return this.http.delete(`api/smme/${id}`);
  }

  getSmme() : Observable<any> {
    return this.http.get<any>('api/smme')
  }

  create(data: any) {
    return this.http.post<any>('api/smme', data)
  }

  getCompanyById(id: number) {
    return this.http.get<any>(`api/smme/${id}`)
  }

  update(id: number, data: any) : Observable<any> {
    return this.http.post<any>(`api/smme/${id}`, data);
  }
}
