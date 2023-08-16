import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IResponseModelBase, IMenu } from '../interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(private http: HttpClient) { }

  getMenu() : Observable<IResponseModelBase<IMenu[]>> {
    return this.http.get<IResponseModelBase<IMenu[]>>('api/menu');
  }
}
