import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IProgramme, IResponseModelBase } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class ProgrammeService {

  constructor(private http: HttpClient) { }

  getProgrammes() : Observable<IResponseModelBase<IProgramme[]>> {
    return this.http.get<IResponseModelBase<IProgramme[]>>(`api/programme`);
  }

  delete(id: number) : Observable<any> {
    return this.http.delete(`api/programme/${id}`);
  }
}
