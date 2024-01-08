import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResponseModelBase } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  constructor(private http: HttpClient) { }

  getCourseList() : Observable<IResponseModelBase<any>> {
    return this.http.get<IResponseModelBase<any>>('api/course');
  }

  add(data: any) : Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>('api/course', data);
  }

  update(id: number, data: any) : Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>(`api/course/${id}`, data)
  }

  delete(id: number) : Observable<any> {
    return this.http.delete(`api/course/${id}`);
  }
}
