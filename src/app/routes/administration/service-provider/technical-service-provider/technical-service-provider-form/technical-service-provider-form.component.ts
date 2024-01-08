import { Component, Inject, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-technical-service-provider-form',
  templateUrl: './technical-service-provider-form.component.html',
  styleUrls: ['./technical-service-provider-form.component.scss']
})
export class TechnicalServiceProviderFormComponent implements OnInit {
  techServiceProForm = this.fb.group({
    full_name: ['', Validators.required],
    physical_address: ['', Validators.required],
    postal_address: [null],
    registration_num: [null],
    email: [null, Validators.required, Validators.email],
    tel_number: [null],
    cell_number: [null, Validators.required],
    description: [null],
    tax_number: [null],
    bbbee_level: [null],
    products: [null]
  });

  constructor(
    private fb: FormBuilder, 
    public dialog: MatDialog,
    private toast: ToastService,
    private dialogRef: MatDialogRef<TechnicalServiceProviderFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
  }

  onSubmit(): void {}

}
