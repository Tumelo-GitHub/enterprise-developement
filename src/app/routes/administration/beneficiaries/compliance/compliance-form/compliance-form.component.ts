import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ComplianceService } from '../../../services/compliance.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import * as _moment from 'moment';
import { IComplianceStatus, IComplianceType } from 'src/app/shared';

const moment = _moment;

@Component({
  selector: 'app-compliance-form',
  templateUrl: './compliance-form.component.html',
  styleUrls: ['./compliance-form.component.scss']
})
export class ComplianceFormComponent implements OnInit {
  statuses: IComplianceStatus[] = [];
  types: IComplianceType[] = [];
  complianceForm = this.fb.group({
    type_id: ['', Validators.required],
    registration_num: ['', Validators.required],
    smme_id: [this.data.compliance.company, Validators.required],
    issued_date: ['', Validators.required],
    expiry_date: ['', Validators.required],
    status: ['', Validators.required],
    isVerified: [''],
    verified_person: [''],
    file: ['']
  });

  constructor(
    private fb: FormBuilder, 
    public dialog: MatDialog, 
    private complianceService: ComplianceService,
    private toast: ToastService,
    private dialogRef: MatDialogRef<ComplianceFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.statuses = this.data.statuses;
    this.types = this.data.types;
    this.complianceForm.patchValue(this.data.compliance);
  }

  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.complianceForm.controls.file.setValue(file)
    }
  }

  onSubmit(): void {
    // add company id
    if (this.complianceForm.valid) {
      this.complianceForm.controls.issued_date.setValue(moment(this.complianceForm.value.issued_date).format('YYYY-MM-DD'));
      this.complianceForm.controls.expiry_date.setValue(moment(this.complianceForm.value.expiry_date).format('YYYY-MM-DD'));
      // new formdata
      const formData: any = new FormData();
      formData.append('file', this.complianceForm.controls.file.value);
      formData.append('type_id', this.complianceForm.controls.type_id.value);
      formData.append('registration_num', this.complianceForm.controls.registration_num.value);
      formData.append('smme_id', this.complianceForm.controls.smme_id.value);
      formData.append('issued_date', this.complianceForm.controls.issued_date.value);
      formData.append('expiry_date', this.complianceForm.controls.expiry_date.value);
      formData.append('status', this.complianceForm.controls.status.value);
      formData.append('isVerified', this.complianceForm.controls.isVerified.value);
      formData.append('verified_person', this.complianceForm.controls.verified_person.value);
      // change date format
      if (this.data.compliance.id) {
        // add file id to formdata
        formData.append('docid', this.data.compliance.docid);
        // update existing record
        this.complianceService.update(this.data.compliance.id, formData).subscribe({
          next: (val) => {
            this.toast.toastNotification('success', 'Success', val.message);
            this.dialogRef.close(val.data);
          },
          error: (err: any) => {
            this.toast.toastNotification('danger', 'Failed', err.message);
            console.error(err)
          }
        })
      } else {
        // add new record
        this.complianceService.create(formData).subscribe({
          next: (val) => {
            this.toast.toastNotification('success', 'Success', val.message);
            console.log(val.data);
            this.dialogRef.close(val.data);
          },
          error: (err: any) => {
            this.toast.toastNotification('danger', 'Failed', err.message);
            console.error(err)
          }
        })
      }
    }
  }
}
