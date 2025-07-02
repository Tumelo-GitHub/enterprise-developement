import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IResponseModelBase } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class ClaimDisbursementService {

  constructor(private http: HttpClient) { }

  create(data: any) : Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>('api/disbursement', data);
  }

  delete(id: number) : Observable<any> {
    return this.http.delete(`api/disbursement/${id}`);
  }

  update(id: number, data: any) : Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>(`api/disbursement/${id}`, data);
  }
}
