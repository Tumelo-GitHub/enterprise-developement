import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IBDSP, IResponseModelBase } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class BdspService {

  constructor(private http: HttpClient) { }

  getBdsp() : Observable<IResponseModelBase<IBDSP[]>> {
    return this.http.get<IResponseModelBase<IBDSP[]>>('api/bdsp')
  }

  delete(id: number) : Observable<any> {
    return this.http.delete(`api/bdsp/${id}`);
  }

  update(id: number, data: any) : Observable<IResponseModelBase<IBDSP>> {
    return this.http.post<IResponseModelBase<IBDSP>>(`api/bdsp/${id}`, data);
  }

  create(data: any) : Observable<IResponseModelBase<IBDSP>> {
    return this.http.post<IResponseModelBase<IBDSP>>('api/bdsp', data)
  }
}
