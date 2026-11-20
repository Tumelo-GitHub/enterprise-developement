import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingEventService } from '../../services/training-event.service';

@Component({
  selector: 'app-training-event-invitations-wrapper',
  templateUrl: './training-event-invitations-wrapper.component.html',
  styleUrls: ['./training-event-invitations-wrapper.component.scss']
})
export class TrainingEventInvitationsWrapperComponent implements OnInit {
  trainingEvent: any;
  eventId!: number;
  showInvitationForm = false;
  formData: any = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private trainingEventService: TrainingEventService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      console.log('Route params received:', params);
      this.eventId = +params['eventId'];
      console.log('Extracted eventId:', this.eventId, 'Type:', typeof this.eventId);
      if (this.eventId) {
        this.loadEventDetails();
      } else {
        console.error('No eventId found in route params');
        this.isLoading = false;
      }
    });
  }

  loadEventDetails() {
    this.isLoading = true;
    // Try to get specific event first
    this.trainingEventService.getTrainingEvent(this.eventId).subscribe({
      next: (response: any) => {
        this.trainingEvent = response.data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading specific event, trying all events:', err);
        this.isLoading = false;
      }
    });
  }

  backToEvents() {
    this.router.navigate(['/support/training']);
  }

  handleShowForm(data: any) {
    this.formData = data;
    this.showInvitationForm = true;
  }

  handleEditForm(data: any) {
    this.formData = data;
    this.showInvitationForm = true;
  }

  handleFormClose() {
    this.showInvitationForm = false;
    this.formData = null;
    // Reload invitations (handled by the table component via ngOnChanges if event reference changes)
  }
}
