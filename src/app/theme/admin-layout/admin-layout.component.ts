import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthService, User } from 'src/app/core';
import { LoaderService } from 'src/app/core';

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
export class AdminLayoutComponent implements OnInit {

  dashMenu: Menu[] = [];
  isDarkTheme: boolean = false;
  isFullScreen: boolean = false;
  user!: User;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver, 
    protected http: HttpClient, 
    private auth: AuthService, 
    public loaderService: LoaderService) {}

  ngOnInit(): void {
    this.menu();
    this.isDarkTheme = localStorage.getItem('theme') === "Dark" ? true : false;
    this.auth.user().subscribe(user => (this.user = user));
  }

  menu() {
    return this.http
      .get<{ menu: Menu[] }>('assets/data/menu.json').subscribe(
        res => this.dashMenu = res.menu)
  }

  storeThemeSelection() {
    localStorage.setItem('theme', this.isDarkTheme ? "Dark" : "Ligiht");
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
    this.auth.logout();
  }

}
