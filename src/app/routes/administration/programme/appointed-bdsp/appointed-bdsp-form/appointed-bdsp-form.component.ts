import { Component, Inject, OnInit } from '@angular/core';
import { BdspService } from '../../../services/bdsp.service';
import { IBDSP } from 'src/app/shared';
import { Validators, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastService } from 'src/app/shared/services/toast.service';
import { BdspAppointmentService } from '../../../services/bdsp-appointment.service';

@Component({
  selector: 'app-appointed-bdsp-form',
  templateUrl: './appointed-bdsp-form.component.html',
  styleUrls: ['./appointed-bdsp-form.component.scss']
})
export class AppointedBdspFormComponent implements OnInit {
  form = this.fb.group({
    programme_id: [this.data.programme_id, Validators.required],
    bdsp_id: [null, Validators.required],
    appointment_date: ['', Validators.required],
    contract_start_date: ['', Validators.required],
    contract_end_date: ['', Validators.required],
    // service_request_start_date: [null],
    // service_request_end_date: [null],
    description: [null]
  });

  companyList: IBDSP[] = [];

  constructor(
    private bdspService: BdspService,
    private fb: FormBuilder, 
    public dialog: MatDialog,
    private toast: ToastService,
    private service: BdspAppointmentService,
    private dialogRef: MatDialogRef<AppointedBdspFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.getCompanyList();
    this.form.patchValue(this.data);
  }

  getCompanyList() {
    this.bdspService.getBdsp().subscribe({
      next: (resp) => {
        this.companyList = resp.data;
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  onSubmit(): void {
    console.log(this.form.value)
    if (this.data.id) {
      this.service.update(this.data.id, this.form.value).subscribe({
        next: response => {
          console.log(response)
          this.toast.toastNotification('success', 'Success', response.message);
          this.dialogRef.close(response.data);
        },
        error: console.log
      });
    } else {
      this.service.create(this.form.value).subscribe({
        next: response => {
          this.toast.toastNotification('success', 'Success', response.message);
          this.dialogRef.close(response.data);
        },
        error: console.log
      });
    }
  }

}
