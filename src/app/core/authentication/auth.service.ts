import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { tap, delay, share } from 'rxjs/operators';
import { TokenService } from './token.service';
import { Router } from '@angular/router';
import { IResponseModelBase, IUser } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public isAuthenticated = new Subject<boolean>();
  private user$ = new BehaviorSubject<IUser>({});

  constructor(private http: HttpClient, private tokenService: TokenService, private router: Router) { 
  }

  login(data: any): Observable<IResponseModelBase<string>> { 
    return this.http.post<IResponseModelBase<string>>('api/login', data).pipe(
      tap(val => { 
        this.tokenService.save(val.data);
        this.user$.next(this.tokenService.decode(val.data).data.user as IUser);
        this.isAuthenticated.next(true);
      })
    );
  }

  register(data: any) : Observable<IResponseModelBase<string>> {
    return this.http.post<IResponseModelBase<string>>('api/register', data).pipe(
      delay(1000),
      tap(val => {
        this.tokenService.save(val.data);
        this.user$.next(this.tokenService.decode(val.data).data.user as IUser);
        this.isAuthenticated.next(true);
      })
    );
  }

  logout() : Observable<IResponseModelBase<boolean>> {
    return this.http.post<IResponseModelBase<boolean>>('api/logout', '').pipe(
      tap(val => { 
        this.isAuthenticated.next(false);
        this.tokenService.remove();
        this.router.navigateByUrl('auth/login');
      })
    );
  }

  user() {
    this.user$.next(this.tokenService.getUser() as IUser);
    return this.user$.pipe(share());
  }
}
