import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IResponseModelBase } from 'src/app/shared';
import { ProgrammeService } from 'src/app/routes/administration/services/programme.service';

export interface ITrainingEventInvitation {
  id?: number;
  training_event_id: number;
  smme_id: number;
  invitation_status: 'invited' | 'confirmed' | 'declined' | 'attended' | 'cancelled';
  invited_by?: number;
  invited_at?: string;
  response_at?: string;
  notes?: string;
  // Joined fields from related tables
  smme_name?: string;
  event_name?: string;
  programme_name?: string;
  course_name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TrainingEventInvitationService {

  constructor(
    private http: HttpClient,
    private programmeService: ProgrammeService
  ) { }

  // Get all invitations for a specific training event
  getEventInvitations(eventId: number): Observable<IResponseModelBase<ITrainingEventInvitation[]>> {
    return this.http.get<IResponseModelBase<ITrainingEventInvitation[]>>(`api/training/event/${eventId}/invitations`);
  }

  // Get invitation by ID
  getInvitationById(invitationId: number): Observable<IResponseModelBase<ITrainingEventInvitation>> {
    return this.http.get<IResponseModelBase<ITrainingEventInvitation>>(`api/training/invitation/${invitationId}`);
  }

  // Invite single beneficiary (supports bulk invitation at backend)
  inviteBeneficiary(data: Partial<ITrainingEventInvitation>): Observable<IResponseModelBase<ITrainingEventInvitation>> {
    return this.http.post<IResponseModelBase<ITrainingEventInvitation>>('api/training/invitation', data);
  }

  // Update invitation (change status, notes, etc.)
  updateInvitation(id: number, data: Partial<ITrainingEventInvitation>): Observable<IResponseModelBase<ITrainingEventInvitation>> {
    return this.http.post<IResponseModelBase<ITrainingEventInvitation>>(`api/training/invitation/${id}`, data);
  }

  // Delete/Remove invitation
  deleteInvitation(id: number): Observable<IResponseModelBase<any>> {
    return this.http.delete<IResponseModelBase<any>>(`api/training/invitation/${id}`);
  }

  // Bulk delete invitations
  bulkDeleteInvitations(invitationIds: number[]): Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>('api/training/invitation/remove', {
      invitation_ids: invitationIds 
    });
  }

  // Update invitation status (confirm, decline, mark attended, etc.)
  updateInvitationStatus(id: number, status: ITrainingEventInvitation['invitation_status']): Observable<IResponseModelBase<ITrainingEventInvitation>> {
    return this.http.post<IResponseModelBase<ITrainingEventInvitation>>(`api/training/invitation/${id}/status`, {
      invitation_status: status
    });
  }

  // Get statistics for event invitations
  getEventInvitationStats(eventId: number): Observable<IResponseModelBase<any>> {
    return this.http.get<IResponseModelBase<any>>(`api/training/event/${eventId}/invitation-stats`);
  }

  // Send reminder to specific beneficiary
  sendReminder(invitationId: number, reminderType: 'email' | 'sms' | 'both' = 'both'): Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>(`api/training/invitation/${invitationId}/reminder`, {
      reminder_type: reminderType
    });
  }

  // Send bulk reminders to multiple beneficiaries
  sendBulkReminders(eventId: number, beneficiaryIds: number[], reminderType: 'email' | 'sms' | 'both' = 'both'): Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>('api/training/invitation/bulk-reminder', {
      training_event_id: eventId,
      smme_ids: beneficiaryIds,
      reminder_type: reminderType
    });
  }

  // Send reminder to all invited beneficiaries for an event
  sendEventReminders(eventId: number, reminderType: 'email' | 'sms' | 'both' = 'both', statusFilter?: ITrainingEventInvitation['invitation_status'][]): Observable<IResponseModelBase<any>> {
    const payload: any = {
      training_event_id: eventId,
      reminder_type: reminderType
    };
    
    if (statusFilter && statusFilter.length > 0) {
      payload.status_filter = statusFilter;
    }
    
    return this.http.post<IResponseModelBase<any>>('api/training/invitation/event-reminders', payload);
  }

  // Get programme beneficiaries (appointed to specific programme) 
  getProgrammeBeneficiaries(programmeId: number): Observable<IResponseModelBase<any[]>> {
    return this.programmeService.getAppointedBeneficiaries(programmeId);
  }

  // Get confirmed beneficiaries for a specific training event
  // Uses existing invitations endpoint and filters for confirmed/attended status
  getConfirmedBeneficiaries(eventId: number): Observable<IResponseModelBase<any>> {
    return this.getEventInvitations(eventId).pipe(
      map(response => ({
        ...response,
        data: (response.data || []).filter(invitation => 
          invitation.invitation_status === 'confirmed' || invitation.invitation_status === 'attended'
        )
      }))
    );
  }
}
