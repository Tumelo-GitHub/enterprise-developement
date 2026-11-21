import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { TokenService } from '../authentication';
import { AuthService } from '../authentication/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  /** null while a refresh is in flight, the new token on success, false on failure. */
  private refreshTokenSubject = new BehaviorSubject<string | null | false>(null);

  /** Auth endpoints answer 401 for bad credentials/tokens; never try to refresh for those. */
  private static readonly NO_REFRESH = ['/login', '/register', '/refresh-token', '/forgot-password', '/reset-password'];

  constructor(
    private tokenService: TokenService, 
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Add token to requests if it exists
    if (this.tokenService.check()) {
      request = this.addToken(request, this.tokenService.getToken()!);
    }

    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          if (TokenInterceptor.NO_REFRESH.some(path => request.url.includes(path))) {
            return throwError(() => error);
          }
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`),
      withCredentials: true,
    });
  }

  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          const token = response.data;
          this.refreshTokenSubject.next(token);
          return next.handle(this.addToken(request, token));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(false); // release requests waiting on this refresh
          this.tokenService.remove();
          this.authService.isAuthenticated.next(false);
          this.router.navigateByUrl('/auth/login');
          return throwError(() => err);
        })
      );
    } else {
      // Wait for token refresh to complete
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => token
          ? next.handle(this.addToken(request, token))
          : throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Session expired' })))
      );
    }
  }
}
