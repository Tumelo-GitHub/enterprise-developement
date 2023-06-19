import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { TokenService } from '../authentication';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private tokenService: TokenService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const handler = () => {
      if (request.url.includes('/auth/logout')) {
        this.router.navigateByUrl('/auth/login');
      }

      if (this.router.url.includes('/auth/login')) {
        this.router.navigateByUrl('/dashboard');
      }
    };

    if (this.tokenService.check()) {
      return next
        .handle(
          request.clone({
            headers: request.headers.append('Authorization', `Bearer ${this.tokenService.getToken()}`),
            withCredentials: true,
          })
        )
        .pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
              console.error(error);
              // this.tokenService.clear();
            }
            return throwError(error);
          }),
          tap(() => handler())
        );
    }
    
    return next.handle(request).pipe(tap(() => handler()));
  }
}
