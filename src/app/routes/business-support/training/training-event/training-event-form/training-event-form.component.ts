import { Component, Inject, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { ProgrammeCourseService } from 'src/app/routes/administration/services/programme-course.service';
import { ProgrammeService } from 'src/app/routes/administration/services/programme.service';
import { IProgramme } from 'src/app/shared';
import { ToastService } from 'src/app/shared/services/toast.service';
import { TrainingEventService } from '../../../services/training-event.service';
import { ServiceProviderService } from 'src/app/routes/administration/services/service-provider.service';

@Component({
  selector: 'app-training-event-form',
  templateUrl: './training-event-form.component.html',
  styleUrls: ['./training-event-form.component.scss']
})
export class TrainingEventFormComponent implements OnInit {
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
    smme_id: [null, Validators.required],
    status_id: [null, Validators.required],
    notification: [null]
  });

  constructor(
    private fb: FormBuilder, 
    public dialog: MatDialog, 
    private toast: ToastService,
    private programmeService: ProgrammeService,
    private programmeCourseService: ProgrammeCourseService,
    private ProgrammeService: ProgrammeService,
    private trainingService: TrainingEventService,
    private serviceProviderService: ServiceProviderService,
    private dialogRef: MatDialogRef<TrainingEventFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    console.log(this.data);
    this.eventForm.patchValue(this.data);
    this.getProgrammeList();
    this.getTrainingServiceProviders();
    this.getTrainingVenues();
    // TODO: check why after submitting the form, the programme_id is not being set
    if (this.eventForm.get('programme_id')?.value) {
      this.getProgrammeCourse(this.data.programme_id);
      this.getAppointedBeneficiaries(this.data.programme_id);
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
    this.getAppointedBeneficiaries(programme.value);
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
    this.serviceProviderService.getServiceProviderByRole(3).subscribe({
      next: response => {
        this.trainerList = response.data;
      },
      error: console.error
      
    });
  }

  onSubmit(): void {
    console.log(this.eventForm.value);
    if (this.data.id) {
      this.trainingService.update(this.data.id, this.eventForm.value).subscribe({
        next: response => {
          this.toast.toastNotification('success', 'success', response.message);
            this.dialogRef.close(response.data);
          },
          error: console.error
        });
    } else {
      this.trainingService.create(this.eventForm.value).subscribe({
      next: response => {
        this.toast.toastNotification('success', 'success', response.message);
          this.dialogRef.close(response.data);
        },
        error: console.error
      });
    }
  }

}
