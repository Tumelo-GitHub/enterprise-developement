import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GenericCompanyService {
  private url = "http://localhost:5000/genericCompanies";
  private api = "https://api.wozaweb.co.za/backend/public/";

  constructor(private http: HttpClient) { }

  addCompany(data: any) : Observable<any> {
    return this.http.post('api/generic', data);
  }

  getCompanyList () : Observable<any> {
    return this.http.get('api/generic');
  }

  updateCompany(id: number, data: any) : Observable<any> {
    return this.http.put(`api/generic/${id}`, data)
  }

  deleteCompany(id: number) : Observable<any> {
    return this.http.delete(`api/smme/${id}`);
  }

  getSmme() : Observable<any> {
    return this.http.get<any>('api/smme')
  }

  upload(data: any) : Observable<any> {
    console.log(data.values);
    return this.http.post('api/document', data)
  }
}
