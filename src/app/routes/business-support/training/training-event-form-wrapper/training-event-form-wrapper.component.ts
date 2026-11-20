import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingEventService } from '../../services/training-event.service';

@Component({
  selector: 'app-training-event-form-wrapper',
  templateUrl: './training-event-form-wrapper.component.html',
  styleUrls: ['./training-event-form-wrapper.component.scss']
})
export class TrainingEventFormWrapperComponent implements OnInit {
  eventData: any = null;
  isEditMode = false;
  eventId: number | null = null;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private trainingEventService: TrainingEventService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.eventId = params['eventId'] ? +params['eventId'] : null;
      this.isEditMode = !!this.eventId;
      
      if (this.isEditMode && this.eventId) {
        this.loadEventData();
      }
    });
  }

  loadEventData() {
    this.isLoading = true;
    this.trainingEventService.getTrainingEvent(this.eventId!).subscribe({
      next: (response: any) => {
        this.eventData = response.data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading event:', err);
        this.isLoading = false;
      }
    });
  }

  onFormSaved(): void {
    this.router.navigate(['/support/training']);
  }

  onFormCancelled(): void {
    this.router.navigate(['/support/training']);
  }
}