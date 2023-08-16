import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BdspEmpService } from '../../../services/bdsp-emp.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { EmployeeFormComponent } from '../../../beneficiaries/employee/employee-form/employee-form.component';

@Component({
  selector: 'app-bdsp-employee-form',
  templateUrl: './bdsp-employee-form.component.html',
  styleUrls: ['./bdsp-employee-form.component.scss']
})
export class BdspEmployeeFormComponent implements OnInit {
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
    private empService: BdspEmpService,
    private toast: ToastService,
    private dialogRef: MatDialogRef<EmployeeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.employeeForm.patchValue(this.data);
  }

  onSubmit(): void {}

}
