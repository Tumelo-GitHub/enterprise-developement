import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TrainingVenueService } from '../../../services/training-venue.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-training-venue-form',
  templateUrl: './training-venue-form.component.html',
  styleUrls: ['./training-venue-form.component.scss']
})
export class TrainingVenueFormComponent implements OnInit {
    form = this.fb.group({
      venue_name: [null, Validators.required],
      address: [null, Validators.required],
      tel_number: [null],
      email: [null]
  });
  
    constructor(private fb: FormBuilder, 
      private _trainingVenueService: TrainingVenueService, 
      private toast: ToastService,
      private dialogRef: MatDialogRef<TrainingVenueFormComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any) { }
  
    ngOnInit(): void {
      this.form.patchValue(this.data);
      // this.form.patchValue({training_institute_id: Number(this.data.training_institute_id)});
    }
  
    onSubmit() {
      if (this.form.valid) {
          const request = this.data.id ? 
              this._trainingVenueService.update(this.data.id, this.form.value) : 
              this._trainingVenueService.add(this.form.value);
  
          request.subscribe({
              next: (val) => {
                  this.handleSuccess(val);
              },
              error: (err: any) => {
                  this.handleError(err);
              }
          });
      }
    }
  
    handleSuccess(val: any) {
        this.toast.toastNotification('success', 'Success', val.message);
        this.dialogRef.close(val.data);
    }
  
    handleError(err: any) {
        this.toast.toastNotification('danger', 'Failed', err.message);
        console.error(err);
    }

}
