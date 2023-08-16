import { Component, Inject, OnInit } from '@angular/core';
import { SmmeEmpService } from '../../../services/smme-emp.service';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss']
})
export class EmployeeFormComponent implements OnInit {
  employeeForm = this.fb.group({
    name: [null, Validators.required],
    surname: [null, Validators.required],
    position: [null],
    role: [null],
    cell_number: [null, Validators.required],
    email: [null, Validators.required],
    company: [this.data.company, Validators.required]
  });

  constructor(
    private fb: FormBuilder, 
    public dialog: MatDialog, 
    private empService: SmmeEmpService,
    private toast: ToastService,
    private dialogRef: MatDialogRef<EmployeeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.employeeForm.patchValue(this.data);
  }

  onSubmit(): void {
    // add company id
    if (this.employeeForm.valid) {
      if (this.data.id) {
        // update existing record
        this.empService.update(this.data.id, this.employeeForm.value).subscribe({
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
        this.empService.create(this.employeeForm.value).subscribe({
          next: (val) => {
            this.toast.toastNotification('success', 'Success', val.message);
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
