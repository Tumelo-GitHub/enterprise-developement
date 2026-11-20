import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TokenService } from './token.service';
import { Router } from '@angular/router';
import { IResponseModelBase, IUser } from 'src/app/shared';
import { ILoginRequest, IRegisterRequest } from 'src/app/shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public isAuthenticated = new BehaviorSubject<boolean>(false);
  private user$ = new BehaviorSubject<IUser | null>(null);

  constructor(
    private http: HttpClient, 
    private tokenService: TokenService, 
    private router: Router
  ) {
    // Initialize auth state on service creation
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    if (this.tokenService.check()) {
      this.isAuthenticated.next(true);
      const user = this.tokenService.getUser();
      this.user$.next(user);
    }
  }

  login(data: ILoginRequest): Observable<IResponseModelBase<string>> { 
    return this.http.post<IResponseModelBase<string>>('api/login', data).pipe(
      tap(val => { 
        this.tokenService.save(val.data);
        const decodedToken = this.tokenService.decode(val.data);
        if (decodedToken && decodedToken.data?.user) {
          const user = decodedToken.data.user as IUser;
          this.user$.next(user);
          this.isAuthenticated.next(true);
          this.router.navigateByUrl('/dashboard');
        }
      }),
      catchError(this.handleError)
    );
  }

  register(data: IRegisterRequest): Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>('api/register', data).pipe(
      catchError(this.handleError)
    );
  }

  forgotPassword(email: string): Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>('api/forgot-password', { email }).pipe(
      catchError(this.handleError)
    );
  }

  updateProfile(id: string, data: any): Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>(`api/user/update/${id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  changePassword(current_password: string, new_password: string): Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>('api/change-password', { current_password, new_password }).pipe(
      catchError(this.handleError)
    );
  }

  resetPassword(token: string, password: string): Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>('api/reset-password', { token, password }).pipe(
      catchError(this.handleError)
    );
  }

  logout(): void {
    this.isAuthenticated.next(false);
    this.user$.next(null);
    this.tokenService.remove();
    this.router.navigateByUrl('auth/login');
  }

  refreshToken(): Observable<IResponseModelBase<string>> {
    return this.http.post<IResponseModelBase<string>>('api/refresh-token', {}).pipe(
      tap(val => {
        if (val.data) {
          this.tokenService.save(val.data);
          const decodedToken = this.tokenService.decode(val.data);
          if (decodedToken && decodedToken.data?.user) {
            const user = decodedToken.data.user as IUser;
            this.user$.next(user);
            this.isAuthenticated.next(true);
          }
        }
      }),
      catchError(error => {
        // Token refresh failed - clear auth
        this.isAuthenticated.next(false);
        this.user$.next(null);
        this.tokenService.remove();
        return this.handleError(error);
      })
    );
  }

  getAllUsers(): Observable<IResponseModelBase<IUser[]>> {
    // Frontend check is UX only - backend MUST verify admin role
    // This prevents users from seeing the admin API call, but security is on backend
    if (!this.tokenService.isAdmin()) {
      return throwError(() => new Error('You are not authorized to perform this action.'));
    }

    return this.http.get<IResponseModelBase<IUser[]>>('api/users').pipe(
      catchError(this.handleError)
    );
  }

  user(): Observable<IUser | null> {
    const user = this.tokenService.getUser() as IUser;
    if (user) {
      this.user$.next(user);
    }
    return this.user$.asObservable();
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred. Please try again.';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error?.error) {
      // Backend error - only show safe messages
      errorMessage = error.error.error;
    }
    
    console.error('Auth error:', error);
    return throwError(() => new Error(errorMessage));
  }
}