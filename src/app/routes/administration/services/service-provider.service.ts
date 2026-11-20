import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IServiceProvider, IResponseModelBase } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class ServiceProviderService {

  constructor(private http: HttpClient) { }

  // Error handling method
  private handleError(error: HttpErrorResponse) {
    console.error('Service Provider API Error:', error);
    console.error('Error details:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      message: error.message,
      error: error.error
    });
    
    let userMessage = 'Something went wrong';
    
    if (error.error?.message) {
      userMessage = error.error.message;
    } else if (error.message) {
      userMessage = error.message;
    } else if (error.status === 0) {
      userMessage = 'Network error - please check your connection';
    } else if (error.status >= 500) {
      userMessage = 'Server error - please try again later';
    } else if (error.status === 404) {
      userMessage = 'API endpoint not found';
    }
    
    return throwError(() => new Error(userMessage));
  }

  // Get all service providers
  getServiceProviderList(): Observable<IResponseModelBase<IServiceProvider[]>> {
    return this.http.get<IResponseModelBase<IServiceProvider[]>>(`api/service-provider`).pipe(
      catchError(this.handleError)
    );
  }

  // Get service providers by service type (filter)
  getServiceProvidersByType(serviceTypeId: number): Observable<IResponseModelBase<IServiceProvider[]>> {
    return this.http.get<IResponseModelBase<IServiceProvider[]>>(`api/service-provider?service_type=${serviceTypeId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Get service provider by id
  getServiceProviderById(id: number): Observable<IResponseModelBase<IServiceProvider>> {
    return this.http.get<IResponseModelBase<IServiceProvider>>(`api/service-provider/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Add new service provider
  add(data: Omit<IServiceProvider, 'id'>): Observable<IResponseModelBase<IServiceProvider>> {
    return this.http.post<any>(`api/service-provider`, data).pipe(
      catchError(this.handleError)
    );
  }

  // Update service provider
  update(id: number, data: Partial<IServiceProvider>): Observable<IResponseModelBase<IServiceProvider>> {
    return this.http.post<any>(`api/service-provider/${id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  // Delete service provider
  delete(id: number): Observable<IResponseModelBase<any>> {
    return this.http.delete<IResponseModelBase<any>>(`api/service-provider/${id}`).pipe(
      catchError(this.handleError)
    );
  }
}