import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-training-register-wrapper',
  templateUrl: './training-register-wrapper.component.html',
  styleUrls: ['./training-register-wrapper.component.scss']
})
export class TrainingRegisterWrapperComponent implements OnInit {
  selectedEventIds: number[] = [];
  showRegisterForm = false;
  editingRegisterRecord: any = null;
  isRegisterEditMode = false;
  registerEventId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['eventIds']) {
        this.selectedEventIds = params['eventIds'].split(',').map((id: string) => +id);
      }
    });
  }

  backToEvents(): void {
    this.router.navigate(['/support/training']);
  }

  // Handle register form
  showAddRegisterForm(eventId: number): void {
    this.registerEventId = eventId;
    this.showRegisterForm = true;
    this.isRegisterEditMode = false;
    this.editingRegisterRecord = null;
  }

  showEditRegisterForm(record: any): void {
    this.showRegisterForm = true;
    this.isRegisterEditMode = true;
    this.editingRegisterRecord = { ...record };
    this.registerEventId = record.event_id;
  }

  hideRegisterForm(): void {
    this.showRegisterForm = false;
    this.isRegisterEditMode = false;
    this.editingRegisterRecord = null;
    this.registerEventId = null;
  }

  onRegisterFormSaved(): void {
    this.hideRegisterForm();
  }

  onRegisterFormCancelled(): void {
    this.hideRegisterForm();
  }
}