import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthService, TokenService } from 'src/app/core';
import { LoaderService } from 'src/app/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ToastService } from 'src/app/shared/services/toast.service';
import { IMenu, IUser } from 'src/app/shared';
import { MenuService } from 'src/app/shared/services/menu.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit, AfterViewChecked {

  dashMenu: IMenu[] = [];
  isDarkTheme: boolean = false;
  isFullScreen: boolean = false;
  user!: IUser;
  loader: boolean = false;
  inactivityTimeout: any;
  warningTimeout: any;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
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
    private tokenService: TokenService) {}

  ngOnInit(): void {
    this.isDarkTheme = localStorage.getItem('theme') === "Dark" ? true : false;
    this.auth.user().subscribe(user => {
      if (user) {
        this.user = user;
        this.setLogoutTimerFromToken();
      }
    });
    
    if (this.isDarkTheme) {
      this.overlay.getContainerElement().classList.add('dark-theme-mode');
    } else {
      this.overlay.getContainerElement().classList.remove('dark-theme-mode');
    }
    this.menu();

    // auto logout after 30 minutes of inactivity
    // this can be user configurable in the future
    // this.startInactivityTimer();
  }

  ngAfterViewChecked() {
    this.loaderService.isLoading$.subscribe(
      resp => this.loader = resp
    );
    this.cdr.detectChanges();
  }

  // @HostListener('window:mousemove')
  // @HostListener('window:keydown')
  // @HostListener('window:click')
  // @HostListener('window:scroll')
  // resetInactivityTimer(): void {
  //   clearTimeout(this.inactivityTimeout);
  //   clearTimeout(this.warningTimeout);
  //   this.startInactivityTimer();
  // }

  /**
   * Function to auto logout user when inactive for 30 minutes
   */
  startInactivityTimer(): void {
    const warningTime = 5 * 60 * 1000; // 5 minutes before logout
    const logoutTime = 30 * 60 * 1000; // 30 minutes

    this.warningTimeout = setTimeout(() => {
      this.showLogoutWarning();
    }, logoutTime - warningTime);

    this.inactivityTimeout = setTimeout(() => {
      this.logout();
      this.dialog.closeAll(); // close all dialog
    }, logoutTime); // 30 minutes
  }

  menu() {
    this.menuService.getMenu().subscribe({
      next: resp => this.dashMenu = resp.data,
      error: err => console.error(err)
    });
  }

  /**
   * Function to set auto logout based on user token exp
   */
  setLogoutTimerFromToken(): void {
    const token = this.tokenService.getToken(); // Assuming you have a method to get the token
    if (token) {
      const decodedToken: any = this.tokenService.decode(token);
      const exp = decodedToken.exp;
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiration = (exp - currentTime) * 1000;
      const warningTime = 5 * 60 * 1000; // 5 minutes before logout

      this.warningTimeout = setTimeout(() => {
        this.showLogoutWarning();
      }, timeUntilExpiration - warningTime);

      setTimeout(() => {
        this.logout();
        this.dialog.closeAll(); // close all dialog
      }, timeUntilExpiration);
    }
  }

  showLogoutWarning(): void {
    this.toast.toastNotification('warning', 'Inactivity Warning', 'You will be logged out in 5 minutes due to inactivity.');
  }

  storeThemeSelection() {
    // toggle theme flag
    this.isDarkTheme = !this.isDarkTheme;
    // set local storage theme
    localStorage.setItem('theme', this.isDarkTheme ? "Dark" : "Ligiht");
    // checnge UI theme class
    if (this.isDarkTheme) {
      this.overlay.getContainerElement().classList.add('dark-theme-mode');
    } else {
      this.overlay.getContainerElement().classList.remove('dark-theme-mode');
    }
  }

  toggleFullScreen() {
    this.isFullScreen = !this.isFullScreen;
    (this.isFullScreen) ? document.documentElement.requestFullscreen() : document.exitFullscreen();
  }

  logout() {
    this.auth.logout().subscribe(
      resp => this.toast.toastNotification('success', '', resp.message)
    )
  }

  printScreen() {
    window.print();
  }
}
