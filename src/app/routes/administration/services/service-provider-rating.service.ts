import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IServiceProviderRating } from 'src/app/shared';

export interface IServiceProviderRatingSummary {
  average_rating: number | null;
  rating_count: number;
}

export interface IServiceProviderRatingListResponse {
  message: string;
  data: IServiceProviderRating[];
  summary: IServiceProviderRatingSummary;
}

export interface IServiceProviderRatingResponse {
  message: string;
  data: IServiceProviderRating;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceProviderRatingService {
  private readonly endpoint = 'api/service-provider-rating';

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    const message = error.error?.message || error.message || 'Request failed';
    return throwError(() => new Error(message));
  }

  getByProviderId(providerId: number): Observable<IServiceProviderRatingListResponse> {
    return this.http
      .get<IServiceProviderRatingListResponse>(`${this.endpoint}/${providerId}`)
      .pipe(catchError(this.handleError));
  }

  add(data: Omit<IServiceProviderRating, 'id' | 'created_at'>): Observable<IServiceProviderRatingResponse> {
    return this.http
      .post<IServiceProviderRatingResponse>(this.endpoint, data)
      .pipe(catchError(this.handleError));
  }

  update(id: number, data: Partial<Omit<IServiceProviderRating, 'id' | 'service_provider_id' | 'created_at'>>): Observable<IServiceProviderRatingResponse> {
    return this.http
      .post<IServiceProviderRatingResponse>(`${this.endpoint}/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.handleError));
  }
}
