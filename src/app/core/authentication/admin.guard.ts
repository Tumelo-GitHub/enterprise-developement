import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { TokenService } from './token.service';

/**
 * Allows only users with the 'admin' role through; everyone else goes to the dashboard.
 * This is UX only. The backend enforces the same rule with its 'admin' filter.
 */
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router, private token: TokenService) {}

  canActivate(): boolean | UrlTree {
    if (!this.token.check()) {
      return this.router.parseUrl('/auth/login');
    }
    return this.token.isAdmin() ? true : this.router.parseUrl('/dashboard');
  }
}
