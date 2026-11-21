import { Injectable } from '@angular/core';
import jwt_decode from "jwt-decode";
import { IUser } from 'src/app/shared';

interface Token {
  iss: string;
  aud: string;
  sub: string;
  nbf: number;
  iat: number;
  exp: number;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor() { }

  decode(token: string): Token | null {
    try {
      return jwt_decode(token) as Token;
    } catch (error) {
      console.error('Token decoding failed:', error);
      return null;
    }
  }

  save(token: string): void {
    try {
      localStorage.setItem('access_token', token);
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  }

  /** Signs the user out locally: clears the access and refresh tokens. */
  remove(): void {
    this.removeAccessToken();
    try {
      localStorage.removeItem('refresh_token');
    } catch (error) {
      console.error('Failed to remove refresh token:', error);
    }
  }

  /** Drops only the (expired) access token, keeping the refresh token so the session can be renewed. */
  removeAccessToken(): void {
    try {
      localStorage.removeItem('access_token');
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  }

  saveRefreshToken(token: string | null | undefined): void {
    if (!token) return;
    try {
      localStorage.setItem('refresh_token', token);
    } catch (error) {
      console.error('Failed to save refresh token:', error);
    }
  }

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem('refresh_token');
    } catch (error) {
      return null;
    }
  }

  getToken(): string | null {
    try {
      return localStorage.getItem('access_token');
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  getUser(): IUser | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = this.decode(token);
      if (decodedToken && decodedToken.data?.user) {
        return decodedToken.data.user;
      }
    }
    return null;
  }

  check(): boolean {
    const token = this.getToken();
    if (token) {
      const decodedToken = this.decode(token);
      if (decodedToken) {
        // Validate token structure
        if (!this.isValidTokenStructure(decodedToken)) {
          console.warn('Invalid token structure detected');
          this.remove();
          return false;
        }
        if (this.isTokenExpired(decodedToken)) {
          this.removeAccessToken(); // expired: keep the refresh token so the session can be renewed
          return false;
        }
        return true;
      }
    }
    return false;
  }

  private isValidTokenStructure(token: Token): boolean {
    return !!(token && 
              token.exp && 
              token.iat && 
              token.data && 
              token.data.user);
  }

  private isTokenExpired(token: Token): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    return token.exp < currentTime;
  }

  /** Role of the signed-in user, from the token ('' when signed out). */
  role(): string {
    const token = this.getToken();
    const decodedToken = token ? this.decode(token) : null;
    return (decodedToken?.data?.user?.role ?? '').toLowerCase();
  }

  isAdmin(): boolean {
    return this.role() === 'admin';
  }

  /** Consultants only get their own timesheet. */
  isConsultant(): boolean {
    return this.role() === 'consultant';
  }
}