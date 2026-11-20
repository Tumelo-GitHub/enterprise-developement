import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { LoaderService } from '../loader/loader.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {

  constructor(public loaderService: LoaderService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Rewrite URLs to absolute paths in production
    if (environment.isProduction) {
      request = request.clone({url: window.location.origin + `/backend/public/${request.url}`});
    }
    
    if (!request.url.includes('/assets')) {
      if (request.url.includes('/login') || request.url.includes('/register')) {
        this.loaderService.isLoginLoading$.next(true);
        return next.handle(request).pipe(
          finalize(() => this.loaderService.isLoginLoading$.next(false))
        );
      } else {
        this.loaderService.isLoading$.next(true);
        return next.handle(request).pipe(
          finalize(() => this.loaderService.isLoading$.next(false))
        );
      }
    } else {
      return next.handle(request);
    }
  }
}
