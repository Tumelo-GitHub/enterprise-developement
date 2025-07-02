import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { catchError, tap, share } from 'rxjs/operators';
import { TokenService } from './token.service';
import { Router } from '@angular/router';
import { IResponseModelBase, IUser } from 'src/app/shared';
import { ILoginRequest, IRegisterRequest } from 'src/app/shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public isAuthenticated = new Subject<boolean>();
  private user$ = new BehaviorSubject<IUser | null>(null);

  constructor(
    private http: HttpClient, 
    private tokenService: TokenService, 
    private router: Router
  ) {}

  login(data: ILoginRequest): Observable<IResponseModelBase<string>> { 
    return this.http.post<IResponseModelBase<string>>('api/login', data).pipe(
      tap(val => { 
        this.tokenService.save(val.data);
        const decodedToken = this.tokenService.decode(val.data);
        const user = decodedToken?.data?.user as IUser;
        this.user$.next(user);
        this.isAuthenticated.next(true);
      }),
      catchError(this.handleError)
    );
  }

  register(data: IRegisterRequest): Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>('api/register', data).pipe(
      catchError(this.handleError)
    );
  }

  logout(): Observable<IResponseModelBase<boolean>> {
    return this.http.post<IResponseModelBase<boolean>>('api/logout', {}).pipe(
      tap(() => { 
        this.isAuthenticated.next(false);
        this.tokenService.remove();
        this.router.navigateByUrl('auth/login');
      }),
      catchError(this.handleError)
    );
  }

  getAllUsers(): Observable<IResponseModelBase<IUser[]>> {
    // check if user is admin
    if (!this.tokenService.isAdmin()) {
      return throwError(() => new Error('You are not authorized to perform this action.'));
    }

    return this.http.get<IResponseModelBase<IUser[]>>('api/users').pipe(
      catchError(this.handleError)
    );
  }

  user(): Observable<IUser | null> {
    const user = this.tokenService.getUser() as IUser;
    this.user$.next(user);
    return this.user$.pipe(share());
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error.error.error || error);
    return throwError(() => new Error(error.error.error || 'An error occurred. Please try again.'));
  }
}