import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { GenericCompanyService } from '../../services/generic-company.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-generic-company-form',
  templateUrl: './generic-company-form.component.html',
  styleUrls: ['./generic-company-form.component.scss']
})
export class GenericCompanyFormComponent implements OnInit {
  companyForm = this.fb.group({
    company_name: [null, Validators.required],
    physical_address: [null, Validators.required],
    postal_address: null,
    dept_name: [null, Validators.required],
    dept_address: [null, Validators.required],
    contact_name: [null, Validators.required], // TODO: make contact_name and contact_surname one field as contact_person_fullname
    contact_surname: [null, Validators.required],
    contact_email: [null, Validators.required],
    contact_cell: [null, Validators.required],
  });

  constructor(
    private fb: FormBuilder, 
    public dialog: MatDialog, 
    private _companyService: GenericCompanyService,
    private toast: ToastService,
    private dialogRef: MatDialogRef<GenericCompanyFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.companyForm.patchValue(this.data);
  }

  onSubmit(): void {
    if (this.companyForm.valid) {
      if (this.data) {
        // update existing record
        this._companyService.update(this.data.id, this.companyForm.value).subscribe({
          next: (response : any) => {
            this.toast.toastNotification('success', 'Success', response.message);
            this.dialogRef.close(response.data);
          },
          error: (err: any) => {
            console.error(err)
          }
        })
      } else {
        // add new record
        this._companyService.add(this.companyForm.value).subscribe({
          next: (response : any) => {
            this.toast.toastNotification('success', 'Success', response.message);
            this.dialogRef.close(response.data);
          },
          error: (err: any) => {
            console.error(err)
          }
        })
      }
    }
  }

}
