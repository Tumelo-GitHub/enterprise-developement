import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
import { tap, delay, share } from 'rxjs/operators';
import { TokenService } from './token.service';
import * as moment from 'moment';
import { Router } from '@angular/router';

const headerOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT'
  })
}

// export interface Token {
//   message: string;
//   user: {
//     id?: number;
//     name?: string;
//     email?: string;
//     updated_at: string | null;
//     created_at: string;
//   };
//   access_token: string
// }

export interface Response {
  message: string,
  access_token: string
}

export interface User {
  id?: number;
  firstName?: string; 
  lastName?: string; 
  phoneNumber?: string; 
  email?: string;
  updated_at?: string | null;
  created_at?: string;
}

export interface Client {
  id?: number;
  name?: string;
  db_name?: string;
  email?: string;
  contact_number?: string;
  alt_contact_number?: string;
  start_date?: string;
  expiry_date?: string;
}

export interface Token {
  iss: string;
  aud : string;
  sub: string;
  nbf: number;
  iat: number;
  exp: number;
  data: any
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public isAuthenticated = new Subject<boolean>();
  private user$ = new BehaviorSubject<User>({});
  private client$ = new BehaviorSubject<Client>({});

  constructor(private http: HttpClient, private tokenService: TokenService, private router: Router) { 
  }

  login(data: any): Observable<any> { 
    return this.http.post<Response>('api/user/login', data).pipe(
      delay(1000),
      tap(val => { 
        this.tokenService.save(val.access_token);
        this.user$.next(this.tokenService.decode(val.access_token).data.user as User);
        this.client$.next(this.tokenService.decode(val.access_token).data.client as Client);
        this.isAuthenticated.next(true);
      })
    );
  }

  clientLogin(data: any): Observable<any> { 
    return this.http.post<Response>('api/client/login', data).pipe(
      delay(1000),
      tap(val => { 
        // this.tokenService.save(val.access_token);
        // this.user$.next(this.tokenService.decode(val.access_token).data.user as User);
        // this.isAuthenticated.next(true);
      })
    );
  }

  register(data: any) {
    return this.http.post<Response>('api/register', data).pipe(
      delay(1000),
      tap(val => {
        this.tokenService.save(val.access_token);
        this.user$.next(this.tokenService.decode(val.access_token).data.user as User);
        this.isAuthenticated.next(true);
      })
    );
  }

  logout() {
    return this.http.post<Response>('api/user/logout', '').pipe(
      tap(val => { 
        this.isAuthenticated.next(false);
        this.tokenService.remove();
        this.router.navigateByUrl('auth/login');
      })
    );
  }

  autoLogout() {
    console.log("started")
    setTimeout(() => {
      this.logout();
      console.log("logged out")
    }, 10000)
  }

  user() {
    this.user$.next(this.tokenService.getUser() as User);
    return this.user$.pipe(share());
  }

  client() {
    this.client$.next(this.tokenService.getClient() as Client);
    return this.client$.pipe(share());
  }

  getClients() {
    return this.http.get<Response>('api/client');
  }
}
