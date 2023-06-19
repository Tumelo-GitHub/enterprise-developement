import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GenericCompanyService {
  private url = "http://localhost:5000/genericCompanies"

  constructor(private http: HttpClient) { }

  addCompany(data: any) : Observable<any> {
    return this.http.post(this.url, data);
  }

  getCompanyList () : Observable<any> {
    return this.http.get(this.url);
  }

  updateCompany(id: number, data: any) : Observable<any> {
    return this.http.put(this.url + `/${id}`, data)
  }

  deleteCompany(id: number) : Observable<any> {
    return this.http.delete(this.url + `/${id}`);
  }
}
