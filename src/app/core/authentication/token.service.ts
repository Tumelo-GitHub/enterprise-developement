import { Injectable } from '@angular/core';
import jwt_decode from "jwt-decode";

interface Token {
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
export class TokenService {

  constructor() { }

  decode(token: string) {
    // console.log(jwt_decode(token));
    // console.log(new Date(1685529701))
    return jwt_decode(token) as Token;
  }

  save(token: string) {
    localStorage.setItem('access_token', token)
  }

  remove() {
    localStorage.removeItem('access_token')
  }

  getToken() {
    return localStorage.getItem('access_token') as string;
  }

  getUser() {
    return this.decode(this.getToken()).data.user;
  }

  getClient() {
    return this.decode(this.getToken()).data.client;
  }

  check() {
    return !!localStorage.getItem('access_token');
  }
}
