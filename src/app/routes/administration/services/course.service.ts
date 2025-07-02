import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICourse, IResponseModelBase } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  constructor(private http: HttpClient) { }

  getCourseList() : Observable<IResponseModelBase<ICourse[]>> {
    return this.http.get<IResponseModelBase<ICourse[]>>('api/course');
  }

  add(data: any) : Observable<IResponseModelBase<ICourse>> {
    return this.http.post<IResponseModelBase<ICourse>>('api/course', data);
  }

  update(id: number, data: any) : Observable<IResponseModelBase<ICourse>> {
    console.log('update funcion', data, id);
    return this.http.post<IResponseModelBase<ICourse>>(`api/course/${id}`, data)
  }

  delete(id: number) : Observable<any> {
    return this.http.delete(`api/course/${id}`);
  }
}
