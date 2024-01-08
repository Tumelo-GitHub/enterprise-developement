import { Component, Inject, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastService } from 'src/app/shared/services/toast.service';
import { QUALIFICATIONS, GENDER } from 'src/app/shared/common/devwizarrd.constants';
import { TrainingEventService } from '../../../services/training-event.service';
import { TrainingEventRegisterService } from '../../../services/training-event-register.service';

@Component({
  selector: 'app-training-register-form',
  templateUrl: './training-register-form.component.html',
  styleUrls: ['./training-register-form.component.scss']
})
export class TrainingRegisterFormComponent implements OnInit {
  beneficiaryList: any[] = [];
  qualifications = QUALIFICATIONS;
  genderOptions = GENDER;
  form = this.fb.group({
    event_id: [null, Validators.required],
    smme_id: [null, Validators.required],
    attendee: [null, Validators.required],
    email: [null, Validators.required],
    tel_number: ['', Validators.required],
    age: [null, Validators.required],
    gender: [null, Validators.required],
    qualification: [null, Validators.required]
  });

  constructor(
    private fb: FormBuilder, 
    public dialog: MatDialog,
    private toast: ToastService,
    private trainingEventService: TrainingEventService,
    private trainingRegisterService: TrainingEventRegisterService,
    private dialogRef: MatDialogRef<TrainingRegisterFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    console.log(this.data)
    this.form.patchValue(this.data);
    this.getInvitedSmme(this.data.event_id);
  }

  onSubmit() : void {
    console.log(this.form.value);
    if (this.data.id) {
      this.trainingRegisterService.update(this.data.id, this.form.value).subscribe({
        next: response => {
          this.toast.toastNotification('success', 'Success', response.message);
          this.dialogRef.close(response.data);
        },
        error: console.error
      });
    } else {
      this.trainingRegisterService.create(this.form.value).subscribe({
        next: response => {
          console.log(response);
          this.toast.toastNotification('success', 'Success', response.message);
          this.dialogRef.close(response.data);
        },
        error: console.error
      });
    }
  }

  getInvitedSmme (id: number) {
    this.trainingEventService.getInvitedSmme(id).subscribe({
      next: response =>  {
        this.beneficiaryList = response.data
      },
      error: console.error
    });
  }

}
