import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IAdminUser, IResponseModelBase } from 'src/app/shared';

/**
 * Admin user management: approve sign-ups, activate/deactivate, change roles.
 * Backend: UserAdmin controller, protected by the 'admin' filter.
 */
@Injectable({
  providedIn: 'root'
})
export class UserAdminService {
  private readonly base = 'api/admin/users';

  constructor(private http: HttpClient) { }

  getUsers(): Observable<IResponseModelBase<{ users: IAdminUser[], roles: string[] }>> {
    return this.http.get<IResponseModelBase<{ users: IAdminUser[], roles: string[] }>>(this.base);
  }

  update(id: number, changes: { active?: 0 | 1, role?: string }): Observable<IResponseModelBase<IAdminUser>> {
    return this.http.post<IResponseModelBase<IAdminUser>>(`${this.base}/${id}`, changes);
  }

  /** Removes a pending sign-up. The backend refuses for accounts that have ever logged in. */
  decline(id: number): Observable<IResponseModelBase<null>> {
    return this.http.delete<IResponseModelBase<null>>(`${this.base}/${id}`);
  }
}
