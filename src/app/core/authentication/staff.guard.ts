import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { TokenService } from './token.service';

/** Where consultants land: the only page they can use. */
export const CONSULTANT_HOME = '/administration/timesheet';

/**
 * Keeps consultants out of everything except their timesheet by sending them to it.
 * This is UX only. Data access is enforced by the backend.
 */
@Injectable({
  providedIn: 'root'
})
export class StaffGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router, private token: TokenService) {}

  canActivate(): boolean | UrlTree {
    return this.token.isConsultant() ? this.router.parseUrl(CONSULTANT_HOME) : true;
  }

  canActivateChild(): boolean | UrlTree {
    return this.canActivate();
  }
}
