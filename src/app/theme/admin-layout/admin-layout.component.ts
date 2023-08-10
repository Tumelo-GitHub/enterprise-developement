import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core';
import { LoaderService } from 'src/app/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ToastService } from 'src/app/shared/services/toast.service';
import { Menu, IUser, IClient } from 'src/app/shared';
import { MenuService } from 'src/app/shared/services/menu.service';
import { BnNgIdleService } from 'bn-ng-idle';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit, AfterViewChecked {

  dashMenu: Menu[] = [];
  isDarkTheme: boolean = false;
  isFullScreen: boolean = false;
  user!: IUser;
  client!: IClient;
  loader: boolean = false;

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
    private bnIdle: BnNgIdleService) {}

  ngOnInit(): void {
    this.isDarkTheme = localStorage.getItem('theme') === "Dark" ? true : false;
    this.auth.user().subscribe(user => (this.user = user));
    this.auth.client().subscribe(client => (this.client = client));
    if (this.isDarkTheme) {
      this.overlay.getContainerElement().classList.add('dark-theme-mode');
    } else {
      this.overlay.getContainerElement().classList.remove('dark-theme-mode');
    }
    this.menu();
    // auto logout
    this.bnIdle.startWatching(1800).subscribe((isTimedOut: boolean) => {
      if (isTimedOut) {
        this.logout();
        this.bnIdle.stopTimer();
      }
    });
  }

  ngAfterViewChecked() {
    this.loaderService.isLoading$.subscribe(
      resp => this.loader = resp
    );
    this.cdr.detectChanges();
  }

  menu() {
    this.menuService.getMenu().subscribe({
      next: resp => this.dashMenu = resp.data,
      error: err => console.error(err)
    });
  }

  storeThemeSelection() {
    localStorage.setItem('theme', this.isDarkTheme ? "Dark" : "Ligiht");
    if (this.isDarkTheme) {
      this.overlay.getContainerElement().classList.add('dark-theme-mode');
    } else {
      this.overlay.getContainerElement().classList.remove('dark-theme-mode');
    }
  }

  getMenuByPermission(menu: Menu[]) {
    // TODO: Menu permission at the backend
    // var permissions = NgxPermissionsService.
    // menu.forEach(singleMenu => {
    //   if (singleMenu.permissions?.only?.includes(''))
    // });
  }

  toggleFullScreen() {
    this.isFullScreen = !this.isFullScreen;
    (this.isFullScreen) ? document.documentElement.requestFullscreen() : document.exitFullscreen();
  }

  logout() {
    this.auth.logout().subscribe(
      resp => this.toast.toastNotification('Sucess', '', resp.message)
    )
  }

}
