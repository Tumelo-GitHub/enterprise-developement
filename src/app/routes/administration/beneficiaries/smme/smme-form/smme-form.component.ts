import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BUSINESS_TYPE, TURNOVER_RANGE } from 'src/app/shared/common/smme.constants';
import { SmmeService } from '../../../services/smme.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-smme-form',
  templateUrl: './smme-form.component.html',
  styleUrls: ['./smme-form.component.scss']
})
export class SmmeFormComponent implements OnInit {
  businessTypeOptions = BUSINESS_TYPE;
  turnoverRangeOptions = TURNOVER_RANGE;
  companyForm = this.fb.group({
    smme_name: [null, Validators.required],
    trading_name: [null],
    business_type: [null, Validators.required],
    products: [null],
    description: [null],
    postal_address: [null],
    contact_person: [null, Validators.required],
    contact_person_position: [null],
    tel_number: [null],
    cel_number: [null, Validators.required],
    email: [null, Validators.required],
    registration_number: [null],
    turnover_range: [null, Validators.required],
    web_address: [null],
    tax_number: [null],
    bbbee: [null, Validators.required],
    full_time_emp: [null],
    part_time_emp: [null],
    casual_emp: [null],
    black_owned: [null],
    woman_owned: [null],
    youth_owned: [null],
    disabled_owned: [null],
    industry: [null],
    business_years: [null],
    programme: [null, Validators.required],
    location_type: [null, Validators.required],
    contact_origin: [null, Validators.required],
    registered: ['No', Validators.required],
    street_address_1: [null, Validators.required],
    street_address_2: [null],
    city: [null, Validators.required],
    province: [null, Validators.required],
    code: [null],
    country: [null, Validators.required],
    address_note: [null]
  });

  constructor(
    private fb: FormBuilder, 
    public dialog: MatDialog, 
    private smmeService: SmmeService,
    private toast: ToastService,
    private dialogRef: MatDialogRef<SmmeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.companyForm.patchValue(this.data);
  }

  onSubmit(): void {
    if (this.companyForm.valid) {
      if (this.data) {
        // update existing record
        this.smmeService.update(this.data.id, this.companyForm.value).subscribe({
          next: (val : any) => {
            this.toast.toastNotification('success', 'Success', val.message);
            this.dialogRef.close(true);
          },
          error: (err: any) => {
            this.toast.toastNotification('danger', 'Failed', err.message);
            console.error(err)
          }
        })
      } else {
        // add new record
        this.smmeService.create(this.companyForm.value).subscribe({
          next: (val : any) => {
            this.toast.toastNotification('success', 'Success', val.message);
            this.dialogRef.close(true);
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
