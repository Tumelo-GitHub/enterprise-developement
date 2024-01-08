import { Component, Inject, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ServiceProviderService } from '../../../services/service-provider.service';

@Component({
  selector: 'app-service-provider-details-form',
  templateUrl: './service-provider-details-form.component.html',
  styleUrls: ['./service-provider-details-form.component.scss']
})
export class ServiceProviderDetailsFormComponent implements OnInit {
  form = this.fb.group({
    name: ['', Validators.required],
    surname: [null, Validators.required],
    email: [null, [Validators.required, Validators.email]],
    tel_number: [null, Validators.required],
    cell_number: [null, Validators.required],
    qualification: [null],
    specialization: [null],
    service_type: [null, [Validators.required, Validators.min(1)]]
  });

  constructor(
    private fb: FormBuilder, 
    public dialog: MatDialog,
    private toast: ToastService,
    private serviceProviderService: ServiceProviderService,
    private dialogRef: MatDialogRef<ServiceProviderDetailsFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    console.log(this.data);
    this.form.patchValue(this.data);
  }

  onSubmit(): void {
    if (this.data.id) {
      this.serviceProviderService.update(this.data.id, this.form.value).subscribe({
        next: response => {
          this.toast.toastNotification('success', 'Success', response.message);
          this.dialogRef.close(response.data);
        }
      });
    } else {
      this.serviceProviderService.create(this.form.value).subscribe({
        next: response => {
          this.toast.toastNotification('success', 'Success', response.message);
          this.dialogRef.close(response.data);
        }
      });
    }
  }

}
