import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IResponseModelBase, Menu } from '../interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(private http: HttpClient) { }

  getMenu() : Observable<IResponseModelBase<Menu[]>> {
    return this.http.get<IResponseModelBase<Menu[]>>('api/menu');
  }
}
