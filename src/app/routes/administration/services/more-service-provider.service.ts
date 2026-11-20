import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IMoreServiceProvider, IResponseModelBase } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class MoreServiceProviderService {
  private readonly endpoint = 'api/other-service-provider';

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    const message = error.error?.message || error.message || 'Request failed';
    return throwError(() => new Error(message));
  }

  getList(): Observable<IResponseModelBase<IMoreServiceProvider[]>> {
    return this.http
      .get<IResponseModelBase<IMoreServiceProvider[]>>(this.endpoint)
      .pipe(catchError(this.handleError));
  }

  getById(id: number): Observable<IResponseModelBase<IMoreServiceProvider>> {
    return this.http
      .get<IResponseModelBase<IMoreServiceProvider>>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.handleError));
  }

  add(data: Omit<IMoreServiceProvider, 'id'>): Observable<IResponseModelBase<IMoreServiceProvider>> {
    return this.http
      .post<IResponseModelBase<IMoreServiceProvider>>(this.endpoint, data)
      .pipe(catchError(this.handleError));
  }

  update(id: number, data: Partial<IMoreServiceProvider>): Observable<IResponseModelBase<IMoreServiceProvider>> {
    return this.http
      .post<IResponseModelBase<IMoreServiceProvider>>(`${this.endpoint}/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<IResponseModelBase<unknown>> {
    return this.http
      .delete<IResponseModelBase<unknown>>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.handleError));
  }
}
