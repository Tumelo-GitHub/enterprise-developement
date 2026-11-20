// Updated Training Event Service with new invitation endpoints

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResponseModelBase } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class TrainingEventService {

  constructor(private http: HttpClient) { }

  // Existing event methods
  getTrainingEvents() : Observable<IResponseModelBase<any>> {
    return this.http.get<IResponseModelBase<any>>('api/training/event');
  }

  getTrainingEvent(id: number) : Observable<IResponseModelBase<any>> {
    return this.http.get<IResponseModelBase<any>>(`api/training/event/${id}`);
  }

  create(data: any) : Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>('api/training/event', data);
  }

  update(id: number, data: any) : Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>(`api/training/event/${id}`, data)
  }

  delete(id: number) : Observable<any> {
    return this.http.delete(`api/training/event/${id}`);
  }

  getTrainingVenue () : Observable<IResponseModelBase<any>> {
    return this.http.get<IResponseModelBase<any>>('api/training/venue');
  }

  // Legacy method - kept for backward compatibility during migration
  // This now calls the new invitations endpoint but filters for confirmed/attended
  getInvitedSmme (event_id: number) : Observable<IResponseModelBase<any>> {
    return this.http.get<IResponseModelBase<any>>(`api/training/event/${event_id}/confirmed-beneficiaries`);
  }

  // New invitation methods
  getEventInvitations(event_id: number) : Observable<IResponseModelBase<any>> {
    return this.http.get<IResponseModelBase<any>>(`api/training/event/${event_id}/invitations`);
  }

  createInvitation(data: any) : Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>('api/training/invitations', data);
  }

  bulkInvite(data: any) : Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>('api/training/invitations/bulk', data);
  }

  updateInvitationStatus(invitationId: number, status: string) : Observable<IResponseModelBase<any>> {
    return this.http.patch<IResponseModelBase<any>>(`api/training/invitations/${invitationId}/status`, { status });
  }

  deleteInvitation(invitationId: number) : Observable<IResponseModelBase<any>> {
    return this.http.delete<IResponseModelBase<any>>(`api/training/invitations/${invitationId}`);
  }

  bulkDeleteInvitations(invitationIds: number[]) : Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>('api/training/invitations/bulk-delete', { ids: invitationIds });
  }

  getInvitationStats(event_id: number) : Observable<IResponseModelBase<any>> {
    return this.http.get<IResponseModelBase<any>>(`api/training/event/${event_id}/invitation-stats`);
  }
}