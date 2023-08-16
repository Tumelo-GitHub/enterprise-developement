import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BdspService {

  constructor(private http: HttpClient) { }

  getBdsp() : Observable<any> {
    return this.http.get<any>('api/bdsp')
  }

  delete(id: number) : Observable<any> {
    return this.http.delete(`api/bdsp/${id}`);
  }

  update(id: number, data: any) : Observable<any> {
    return this.http.post<any>(`api/bdsp/${id}`, data);
  }

  create(data: any) {
    return this.http.post<any>('api/bdsp', data)
  }
}
