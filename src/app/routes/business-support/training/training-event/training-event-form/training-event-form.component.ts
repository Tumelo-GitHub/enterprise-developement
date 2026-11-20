import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { ProgrammeCourseService } from 'src/app/routes/administration/services/programme-course.service';
import { ProgrammeService } from 'src/app/routes/administration/services/programme.service';
import { IProgramme } from 'src/app/shared';
import { ToastService } from 'src/app/shared/services/toast.service';
import { TrainingEventService } from '../../../services/training-event.service';
import { ServiceProviderService } from 'src/app/routes/administration/services/service-provider.service';
import { formatDateToLocal } from '../../../../../shared/utils/date.util';

@Component({
  selector: 'app-training-event-form',
  templateUrl: './training-event-form.component.html',
  styleUrls: ['./training-event-form.component.scss']
})
export class TrainingEventFormComponent implements OnInit {
  @Input() eventData: any = null;
  @Input() isEditMode: boolean = false;
  @Output() saved: EventEmitter<any> = new EventEmitter();
  @Output() cancelled: EventEmitter<void> = new EventEmitter();
  
  programmeList: IProgramme[] = [];
  courseList: any[] = [];
  companyList: any[] = [];
  trainerList: any[] = [];
  venues: any[] = [];
  eventForm = this.fb.group({
    programme_id: [null, Validators.required],
    service_provider_id: [null, Validators.required],
    course_id: [null, Validators.required],
    venue_id: [null, Validators.required],
    event_date: ['', Validators.required],
    start_time: [null, Validators.required],
    end_time: [null, Validators.required],
    smme_id: [null], // Made optional - beneficiaries can be invited later
    status_id: [null, Validators.required],
    notification: [null] // Optional - used only when beneficiaries are selected
  });

  constructor(
    private fb: FormBuilder, 
    public dialog: MatDialog, 
    private toast: ToastService,
    private programmeService: ProgrammeService,
    private programmeCourseService: ProgrammeCourseService,
    private ProgrammeService: ProgrammeService,
    private trainingService: TrainingEventService,
    private serviceProviderService: ServiceProviderService
  ) { }

  ngOnInit(): void {
    // Update form validation based on edit mode
    if (this.isEditMode) {
      // In edit mode, make beneficiaries optional since they're managed separately
      this.eventForm.get('smme_id')?.clearValidators();
      this.eventForm.get('smme_id')?.updateValueAndValidity();
      // Also make notification optional in edit mode
      this.eventForm.get('notification')?.clearValidators();
      this.eventForm.get('notification')?.updateValueAndValidity();
    }
    
    if (this.eventData) {
      console.log(this.eventData);
      this.eventForm.patchValue(this.eventData);
    }
    this.getProgrammeList();
    this.getTrainingServiceProviders();
    this.getTrainingVenues();
    // TODO: check why after submitting the form, the programme_id is not being set
    if (this.eventForm.get('programme_id')?.value) {
      this.getProgrammeCourse(this.eventData.programme_id);
      // Only load beneficiaries in create mode
      if (!this.isEditMode) {
        this.getAppointedBeneficiaries(this.eventData.programme_id);
      }
    }
  }

  getProgrammeList() {
    this.programmeService.getProgrammes().subscribe({
      next: (resp) => {
        this.programmeList = resp.data;
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  onProgrammeChange(programme: MatSelectChange) {
    this.getProgrammeCourse(programme.value);
    // Only load beneficiaries in create mode
    if (!this.isEditMode) {
      this.getAppointedBeneficiaries(programme.value);
    }
  }

  getProgrammeCourse(programme_id: number) {
    this.programmeCourseService.getProgrammeCourse(programme_id).subscribe({
      next: response => {
        console.log(response);
        this.courseList = response.data;
      }
    });
  }

  getAppointedBeneficiaries(programme_id: number) : void {
    this.ProgrammeService.getAppointedBeneficiaries(programme_id).subscribe({
      next: data => {
        this.companyList = data.data;
      },
      error: err => {
        console.error(err);
      }
    });
  }

  getTrainingVenues () : void {
    this.trainingService.getTrainingVenue().subscribe({
      next: response => {
        this.venues = response.data;
      },
      error: console.error
    });
  }

  getTrainingServiceProviders () : void {
    this.serviceProviderService.getServiceProvidersByType(3).subscribe({
      next: (response: any) => {
        this.trainerList = response.data;
      },
      error: console.error
    });
  }

  onSubmit(): void {
    // Format event_date to local date string
    if (this.eventForm.value.event_date)
    {
      const formattedDate = formatDateToLocal(this.eventForm.value.event_date as unknown as Date);
      this.eventForm.patchValue({ event_date: formattedDate });
    }
    
    if (this.eventData?.id) {
      this.trainingService.update(this.eventData.id, this.eventForm.value).subscribe({
        next: response => {
          this.toast.toastNotification('success', 'success', response.message);
          this.saved.emit(response.data);
        },
        error: console.error
      });
    } else {
      this.trainingService.create(this.eventForm.value).subscribe({
        next: response => {
          this.toast.toastNotification('success', 'success', response.message);
          this.saved.emit(response.data);
        },
        error: console.error
      });
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

}
