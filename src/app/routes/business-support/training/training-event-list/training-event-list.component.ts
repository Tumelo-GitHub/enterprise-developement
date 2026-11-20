import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-training-event-list',
  templateUrl: './training-event-list.component.html',
  styleUrls: ['./training-event-list.component.scss']
})
export class TrainingEventListComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  // Handle register view from training-event component
  showEventRegister(eventIds: number[]): void {
    // Navigate to register route with event IDs as query params
    this.router.navigate(['/support/training/register'], { 
      queryParams: { eventIds: eventIds.join(',') } 
    });
  }

  // Handle form view from training-event component  
  showAddForm(): void {
    this.router.navigate(['/support/training/new']);
  }

  showEditForm(event: any): void {
    this.router.navigate(['/support/training', event.id, 'edit']);
  }
}
