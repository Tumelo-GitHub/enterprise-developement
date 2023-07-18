import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BdspService } from '../../../services/bdsp.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-bdsp-form',
  templateUrl: './bdsp-form.component.html',
  styleUrls: ['./bdsp-form.component.scss']
})
export class BdspFormComponent implements OnInit {
  bdspForm = this.fb.group({
    bdsp_name: [null, Validators.required],
    physical_address: [null],
    postal_address: [null, Validators.required],
    tell_number: [null],
    cell_number: [null],
    email: [null],
    description: [null, Validators.required],
    products: [null],
    registration: [null],
    tax_number: [null, Validators.required],
    bbbee_level: [null, Validators.required]
  });

  constructor(
    private fb: FormBuilder, 
    public dialog: MatDialog, 
    private bdspService: BdspService,
    private toast: ToastService,
    private dialogRef: MatDialogRef<BdspFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.bdspForm.patchValue(this.data);
  }

  onSubmit(): void {
    if (this.bdspForm.valid) {
      if (this.data) {
        // update existing record
        this.bdspService.update(this.data.id, this.bdspForm.value).subscribe({
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
        this.bdspService.create(this.bdspForm.value).subscribe({
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
