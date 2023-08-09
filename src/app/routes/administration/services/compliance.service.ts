import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICompliance, IComplianceStatus, IComplianceType, IResponseModelBase } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class ComplianceService {

  constructor(private http: HttpClient) { }

  getComplienceListByCompany(id: number) : Observable<IResponseModelBase<ICompliance[]>> {
    return this.http.get<IResponseModelBase<ICompliance[]>>(`api/compliance/${id}`);
  }

  delete(id: number) : Observable<any> {
    return this.http.delete(`api/compliance/${id}`);
  }

  update(id: number, data: any) : Observable<IResponseModelBase<ICompliance>> {
    return this.http.post<IResponseModelBase<ICompliance>>(`api/compliance/${id}`, data);
  }

  create(data: any) : Observable<IResponseModelBase<ICompliance>> {
    return this.http.post<IResponseModelBase<ICompliance>>('api/compliance', data);
  }

  getStatus() : Observable<IResponseModelBase<IComplianceStatus[]>> {
    return this.http.get<IResponseModelBase<IComplianceStatus[]>>('api/compliance/status');
  }

  getTypes() {
    return this.http.get<IResponseModelBase<IComplianceType[]>>('api/compliance/types');
  }

  displayDoc(id: number) {
    const httpOptions = {
      responseType: 'blob' as 'json'
    };
    return this.http.get<any>(`api/document/${id}`, httpOptions);
  }
}
