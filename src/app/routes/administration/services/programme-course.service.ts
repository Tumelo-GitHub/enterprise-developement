import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResponseModelBase } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class ProgrammeCourseService {

  constructor(private http: HttpClient) { }

  getProgrammeCourse(id: number) : Observable<IResponseModelBase<any>> {
    return this.http.get<IResponseModelBase<any>>(`api/programme/course/${id}`);
  }

  add(data: any) : Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>('api/programme/course', data);
  }

  update(id: number, data: any) : Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>(`api/programme/course/${id}`, data)
  }

  delete(id: number) : Observable<any> {
    return this.http.delete(`api/programme/course/${id}`);
  }
}
