import { AfterViewChecked, ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService, TokenService } from 'src/app/core';
import { LoaderService } from 'src/app/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ToastService } from 'src/app/shared/services/toast.service';
import { IMenu, IUser } from 'src/app/shared';
import { MenuService } from 'src/app/shared/services/menu.service';
import { MatDialog } from '@angular/material/dialog';
import { LogoutWarningDialogComponent } from './logout-warning-dialog/logout-warning-dialog.component';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit, AfterViewChecked, OnDestroy {
  dashMenu: IMenu[] = [];
  isDarkTheme: boolean = false;
  isFullScreen: boolean = false;
  user!: IUser;
  loader: boolean = false;

  private destroy$ = new Subject<void>();
  private inactivityTimeout: any;
  private tokenExpirationTimeout: any;
  private dialogShown = false;
  private isLoggingOut = false;
  private readonly ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll'];
  private onUserActivityBound = this.onUserActivity.bind(this);

  // Session timeout configuration (in milliseconds)
  private readonly INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly TOKEN_WARNING_TIME = 5 * 60 * 1000; // 5 minutes before logout
  private readonly SILENT_REFRESH_LEAD = 60 * 1000; // renew 1 minute before the access token expires

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(result => result.matches),
    shareReplay()
  );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private overlay: OverlayContainer,
    protected http: HttpClient,
    private auth: AuthService,
    public loaderService: LoaderService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
    private menuService: MenuService,
    private dialog: MatDialog,
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeTheme();
    this.initializeUser();
    this.loadMenuData();
    this.startSessionMonitoring();
  }

  ngAfterViewChecked(): void {
    this.loaderService.isLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => this.loader = resp);
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.endSessionMonitoring();
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.performLogout();
  }

  storeThemeSelection(): void {
    this.isDarkTheme = !this.isDarkTheme;
    const theme = this.isDarkTheme ? 'Dark' : 'Light';
    localStorage.setItem('theme', theme);
    this.applyTheme();
  }

  toggleFullScreen(): void {
    this.isFullScreen = !this.isFullScreen;
    this.isFullScreen ? document.documentElement.requestFullscreen() : document.exitFullscreen();
  }

  printScreen(): void {
    window.print();
  }

  // ============================================================================
  // PRIVATE METHODS - Initialization
  // ============================================================================

  private initializeTheme(): void {
    this.isDarkTheme = localStorage.getItem('theme') === 'Dark';
    this.applyTheme();
  }

  private applyTheme(): void {
    const container = this.overlay.getContainerElement();
    if (this.isDarkTheme) {
      container.classList.add('dark-theme-mode');
    } else {
      container.classList.remove('dark-theme-mode');
    }
  }

  private initializeUser(): void {
    this.auth.user()
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.user = user;
          this.setLogoutTimerFromToken();
        }
      });
  }

  private loadMenuData(): void {
    this.menuService.getMenu()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: resp => this.dashMenu = resp.data,
        error: err => console.error('Failed to load menu:', err)
      });
  }

  private startSessionMonitoring(): void {
    this.startInactivityTimer();
    this.attachActivityListeners();
  }

  private endSessionMonitoring(): void {
    this.clearAllTimeouts();
    this.removeActivityListeners();
  }

  // ============================================================================
  // PRIVATE METHODS - Inactivity Handling
  // ============================================================================

  private attachActivityListeners(): void {
    this.ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, this.onUserActivityBound);
    });
  }

  private removeActivityListeners(): void {
    this.ACTIVITY_EVENTS.forEach(event => {
      document.removeEventListener(event, this.onUserActivityBound);
    });
  }

  private onUserActivity(): void {
    if (this.dialogShown) return;
    this.resetInactivityTimer();
  }

  private startInactivityTimer(): void {
    this.inactivityTimeout = setTimeout(() => {
      this.handleInactivityLogout();
    }, this.INACTIVITY_TIMEOUT);
  }

  private resetInactivityTimer(): void {
    this.clearInactivityTimer();
    this.startInactivityTimer();
  }

  private clearInactivityTimer(): void {
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
      this.inactivityTimeout = null;
    }
  }

  private handleInactivityLogout(): void {
    this.toast.toastNotification('warning', 'Session Expired', 'You have been logged out due to inactivity.');
    this.performLogout();
  }

  // ============================================================================
  // PRIVATE METHODS - Token Expiration Handling
  // ============================================================================

  private setLogoutTimerFromToken(): void {
    // Called on every user emission (including after a refresh), so never stack timers
    if (this.tokenExpirationTimeout) {
      clearTimeout(this.tokenExpirationTimeout);
      this.tokenExpirationTimeout = null;
    }
    const token = this.tokenService.getToken();
    if (!token) return;

    const decodedToken = this.tokenService.decode(token);
    if (!decodedToken?.exp) return;

    const timeUntilExpiration = this.calculateTimeUntilExpiration(decodedToken.exp);

    // With a refresh token, renew quietly shortly before expiry. Idle users are still
    // logged out by the inactivity timer.
    if (this.tokenService.getRefreshToken()) {
      this.tokenExpirationTimeout = setTimeout(
        () => this.silentRefresh(),
        Math.max(timeUntilExpiration - this.SILENT_REFRESH_LEAD, 0)
      );
      return;
    }

    if (timeUntilExpiration <= 0) {
      this.performLogout();
      return;
    }

    this.scheduleTokenWarning(timeUntilExpiration);
  }

  private silentRefresh(): void {
    this.tokenExpirationTimeout = null;
    this.auth.refreshToken()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.setLogoutTimerFromToken(),
        error: () => {
          // Refresh token expired or revoked (e.g. password changed elsewhere)
          this.toast.toastNotification('warning', 'Session Expired', 'Your session has expired. Please login again.');
          this.performLogout();
        }
      });
  }

  private calculateTimeUntilExpiration(exp: number): number {
    const currentTime = Math.floor(Date.now() / 1000);
    return (exp - currentTime) * 1000; // Convert to milliseconds
  }

  private scheduleTokenWarning(timeUntilExpiration: number): void {
    const timeBeforeWarning = timeUntilExpiration - this.TOKEN_WARNING_TIME;

    if (timeBeforeWarning > 0) {
      this.tokenExpirationTimeout = setTimeout(() => {
        if (!this.dialogShown) {
          this.showTokenExpirationWarning(300); // 5 minutes = 300 seconds
        }
      }, timeBeforeWarning);
    } else {
      // Token expires in less than 5 minutes
      const remainingSeconds = Math.round(timeUntilExpiration / 1000);
      this.showTokenExpirationWarning(remainingSeconds);
    }
  }

  private showTokenExpirationWarning(secondsUntilLogout: number): void {
    this.dialogShown = true;

    const dialogRef = this.dialog.open(LogoutWarningDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        timeUntilLogout: secondsUntilLogout,
        onRenew: () => this.renewToken()
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.dialogShown = false;
        if (result?.action === 'logout') {
          this.performLogout();
        }
      });
  }

  // ============================================================================
  // PRIVATE METHODS - Token Renewal & Logout
  // ============================================================================

  private renewToken(): void {
    this.auth.refreshToken()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.toastNotification('success', 'Session Renewed', 'Your session has been extended.');
          this.resetSessionTimers();
        },
        error: (error) => {
          // Only logout if token is actually expired, not just because the API call failed
          const token = this.tokenService.getToken();
          if (token) {
            const decodedToken = this.tokenService.decode(token);
            if (decodedToken && decodedToken.exp) {
              const currentTime = Math.floor(Date.now() / 1000);
              if (decodedToken.exp > currentTime) {
                // Token is still valid, just show error
                this.toast.toastNotification('danger', 'Session Renewal Failed', 'Unable to renew session. Please try again later.');
                this.resetSessionTimers(); // Re-schedule the warning
                return;
              }
            }
          }
          // Token is expired or invalid, logout
          this.toast.toastNotification('danger', 'Session Expired', 'Your session has expired. Please login again.');
          this.performLogout();
        }
      });
  }

  private resetSessionTimers(): void {
    this.clearAllTimeouts();
    this.setLogoutTimerFromToken();
    this.startInactivityTimer();
  }

  private performLogout(): void {
    if (this.isLoggingOut) return;

    this.isLoggingOut = true;
    this.cleanupBeforeLogout();
    this.auth.logout();
    this.redirectToLogin();
  }

  private cleanupBeforeLogout(): void {
    this.clearAllTimeouts();
    this.dialogShown = false;
    this.dialog.closeAll();
    this.tokenService.remove();
  }

  private redirectToLogin(): void {
    this.toast.toastNotification('success', '', 'You have been logged out successfully.');
    setTimeout(() => {
      this.router.navigate(['/auth/login']);
    }, 500);
  }

  private clearAllTimeouts(): void {
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
      this.inactivityTimeout = null;
    }
    if (this.tokenExpirationTimeout) {
      clearTimeout(this.tokenExpirationTimeout);
      this.tokenExpirationTimeout = null;
    }
  }
}
