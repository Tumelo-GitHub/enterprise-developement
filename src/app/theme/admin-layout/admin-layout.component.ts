import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthService, User, Client } from 'src/app/core';
import { LoaderService } from 'src/app/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ToastService } from 'src/app/shared/services/toast.service';

export interface MenuTag {
  color: string; // background color
  value: string;
}

export interface MenuPermissions {
  only: string | string[];
  except: string | string[];
}

export interface MenuChildrenItem {
  route: string;
  name: string;
  type: 'link' | 'sub' | 'extLink' | 'extTabLink';
  children?: MenuChildrenItem[];
  permissions?: MenuPermissions;
}

export interface Menu {
  route: string;
  name: string;
  type: 'link' | 'sub' | 'extLink' | 'extTabLink';
  icon: string;
  label?: MenuTag;
  badge?: MenuTag;
  children?: MenuChildrenItem[];
  permissions: MenuPermissions;
}



@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit, AfterViewChecked {

  dashMenu: Menu[] = [];
  isDarkTheme: boolean = false;
  isFullScreen: boolean = false;
  user!: User;
  client!: Client;
  loader: boolean = false;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver, 
    private overlay: OverlayContainer,
    protected http: HttpClient, 
    private auth: AuthService, 
    public loaderService: LoaderService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService) {}

  ngOnInit(): void {
    this.menu();
    this.isDarkTheme = localStorage.getItem('theme') === "Dark" ? true : false;
    this.auth.user().subscribe(user => (this.user = user));
    this.auth.client().subscribe(client => (this.client = client));
    if (this.isDarkTheme) {
      this.overlay.getContainerElement().classList.add('dark-theme-mode');
    } else {
      this.overlay.getContainerElement().classList.remove('dark-theme-mode');
    }
  }

  ngAfterViewChecked() {
    this.loaderService.isLoading$.subscribe(
      resp => this.loader = resp
    );
    this.cdr.detectChanges();
  }

  menu() {
    return this.http
      .get<{ menu: Menu[] }>('assets/data/menu.json').subscribe(
        res => this.dashMenu = res.menu)
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
