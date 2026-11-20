import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import { IMentorshipEvent, IResponseModelBase } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class MentorshipEventService {

  // Mock data
  private mockMentorshipEvents: IMentorshipEvent[] = [
    {
      id: 1,
      programme_id: 1,
      mentor_id: 1,
      address: "123 Business Center, Johannesburg CBD, Gauteng",
      event_date: "2025-01-15",
      event_time: "09:00",
      status: 1,
      beneficiaries: [1, 2, 3],
      programme_name: "SMME Development Programme",
      mentor_name: "Sarah",
      mentor_surname: "Johnson",
      status_name: "Scheduled"
    },
    {
      id: 2,
      programme_id: 2,
      mentor_id: 2,
      address: "456 Innovation Hub, Pretoria, Gauteng",
      event_date: "2025-01-20",
      event_time: "14:30",
      status: 2,
      beneficiaries: [4, 5],
      programme_name: "Digital Skills Programme",
      mentor_name: "Michael",
      mentor_surname: "Smith",
      status_name: "Completed"
    },
    {
      id: 3,
      programme_id: 1,
      mentor_id: 3,
      address: "789 Technology Park, Cape Town, Western Cape",
      event_date: "2025-02-05",
      event_time: "10:00",
      status: 4,
      beneficiaries: [1, 6, 7, 8],
      programme_name: "SMME Development Programme",
      mentor_name: "David",
      mentor_surname: "Williams",
      status_name: "Postponed"
    }
  ];

  private mockProgrammes = [
    { id: 1, programme_name: "SMME Development Programme" },
    { id: 2, programme_name: "Digital Skills Programme" },
    { id: 3, programme_name: "Youth Entrepreneurship Programme" },
    { id: 4, programme_name: "Women in Business Programme" }
  ];

  private mockMentors = [
    { id: 1, name: "Sarah", surname: "Johnson", email: "sarah.johnson@example.com" },
    { id: 2, name: "Michael", surname: "Smith", email: "michael.smith@example.com" },
    { id: 3, name: "David", surname: "Williams", email: "david.williams@example.com" },
    { id: 4, name: "Jennifer", surname: "Brown", email: "jennifer.brown@example.com" }
  ];

  private mockBeneficiaries = [
    { id: 1, name: "John Doe", smme_name: "Tech Solutions" },
    { id: 2, name: "Jane Smith", smme_name: "Creative Designs" },
    { id: 3, name: "Robert Johnson", smme_name: "Green Energy Co" },
    { id: 4, name: "Lisa Anderson", smme_name: "Digital Marketing Hub" },
    { id: 5, name: "Mark Wilson", smme_name: "Food Innovations" },
    { id: 6, name: "Emily Davis", smme_name: "Fashion Forward" },
    { id: 7, name: "Chris Taylor", smme_name: "Construction Plus" },
    { id: 8, name: "Anna Martinez", smme_name: "Health Solutions" }
  ];

  private nextId = 4;

  constructor(private http: HttpClient) { }

  // Get all mentorship events
  getAllMentorshipEvents(): Observable<IResponseModelBase<IMentorshipEvent[]>> {
    return of({
      message: 'Mentorship events retrieved successfully',
      data: this.mockMentorshipEvents
    }).pipe(delay(500)); // Simulate API delay
  }

  // Get mentorship events by programme
  getMentorshipEventsByProgramme(programmeId: number): Observable<IResponseModelBase<IMentorshipEvent[]>> {
    const filtered = this.mockMentorshipEvents.filter(event => event.programme_id === programmeId);
    return of({
      message: 'Mentorship events filtered successfully',
      data: filtered
    }).pipe(delay(500));
  }

  // Get mentorship events by mentor
  getMentorshipEventsByMentor(mentorId: number): Observable<IResponseModelBase<IMentorshipEvent[]>> {
    const filtered = this.mockMentorshipEvents.filter(event => event.mentor_id === mentorId);
    return of({
      message: 'Mentorship events filtered successfully',
      data: filtered
    }).pipe(delay(500));
  }

  // Get mentorship event by id
  getMentorshipEventById(id: number): Observable<IResponseModelBase<IMentorshipEvent>> {
    const event = this.mockMentorshipEvents.find(e => e.id === id);
    if (event) {
      return of({
        message: 'Mentorship event retrieved successfully',
        data: event
      }).pipe(delay(300));
    } else {
      return throwError(() => new Error('Mentorship event not found'));
    }
  }

  // Add new mentorship event
  create(data: Omit<IMentorshipEvent, 'id'>): Observable<IResponseModelBase<IMentorshipEvent>> {
    const programme = this.mockProgrammes.find(p => p.id === data.programme_id);
    const mentor = this.mockMentors.find(m => m.id === data.mentor_id);
    
    const newEvent: IMentorshipEvent = {
      ...data,
      id: this.nextId++,
      programme_name: programme?.programme_name || 'Unknown Programme',
      mentor_name: mentor?.name || 'Unknown',
      mentor_surname: mentor?.surname || 'Mentor',
      status_name: this.getStatusName(data.status)
    };

    this.mockMentorshipEvents.push(newEvent);

    return of({
      message: 'Mentorship event created successfully',
      data: newEvent
    }).pipe(delay(800));
  }

  // Update mentorship event
  update(id: number, data: Partial<IMentorshipEvent>): Observable<IResponseModelBase<IMentorshipEvent>> {
    const index = this.mockMentorshipEvents.findIndex(e => e.id === id);
    if (index !== -1) {
      const programme = this.mockProgrammes.find(p => p.id === data.programme_id);
      const mentor = this.mockMentors.find(m => m.id === data.mentor_id);

      this.mockMentorshipEvents[index] = {
        ...this.mockMentorshipEvents[index],
        ...data,
        programme_name: programme?.programme_name || this.mockMentorshipEvents[index].programme_name,
        mentor_name: mentor?.name || this.mockMentorshipEvents[index].mentor_name,
        mentor_surname: mentor?.surname || this.mockMentorshipEvents[index].mentor_surname,
        status_name: data.status ? this.getStatusName(data.status) : this.mockMentorshipEvents[index].status_name
      };

      return of({
        message: 'Mentorship event updated successfully',
        data: this.mockMentorshipEvents[index]
      }).pipe(delay(800));
    } else {
      return throwError(() => new Error('Mentorship event not found'));
    }
  }

  // Delete mentorship event
  delete(id: number): Observable<IResponseModelBase<any>> {
    const index = this.mockMentorshipEvents.findIndex(e => e.id === id);
    if (index !== -1) {
      this.mockMentorshipEvents.splice(index, 1);
      return of({
        message: 'Mentorship event deleted successfully',
        data: { id }
      }).pipe(delay(500));
    } else {
      return throwError(() => new Error('Mentorship event not found'));
    }
  }

  // Get programmes list (for dropdown)
  getProgrammes(): Observable<IResponseModelBase<any[]>> {
    return of({
      message: 'Programmes retrieved successfully',
      data: this.mockProgrammes
    }).pipe(delay(300));
  }

  // Get mentors list (for dropdown)
  getMentors(): Observable<IResponseModelBase<any[]>> {
    return of({
      message: 'Mentors retrieved successfully',
      data: this.mockMentors
    }).pipe(delay(300));
  }

  // Get beneficiaries list (for multi-select)
  getBeneficiaries(): Observable<IResponseModelBase<any[]>> {
    return of({
      message: 'Beneficiaries retrieved successfully',
      data: this.mockBeneficiaries
    }).pipe(delay(300));
  }

  // Helper method to get status name
  private getStatusName(statusId: number): string {
    const statusMap: { [key: number]: string } = {
      1: 'Scheduled',
      2: 'Completed',
      3: 'Cancelled',
      4: 'Postponed',
      5: 'In Progress'
    };
    return statusMap[statusId] || 'Unknown';
  }
}