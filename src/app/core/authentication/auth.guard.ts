import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router, private token: TokenService, private auth: AuthService) {}

  canActivate(): Observable<boolean | UrlTree> | boolean | UrlTree {
    return this.authenticate();
  }

  canActivateChild(): Observable<boolean | UrlTree> | boolean | UrlTree {
    return this.authenticate();
  }

  /**
   * Valid access token: allow. Expired but a refresh token is stored (e.g. reopening the app
   * after an hour): renew the session first. Otherwise go to the login page.
   */
  private authenticate(): Observable<boolean | UrlTree> | boolean | UrlTree {
    if (this.token.check()) {
      return true;
    }
    if (!this.token.getRefreshToken()) {
      return this.router.parseUrl('/auth/login');
    }
    return this.auth.refreshToken().pipe(
      map(() => true),
      catchError(() => of(this.router.parseUrl('/auth/login')))
    );
  }
}
