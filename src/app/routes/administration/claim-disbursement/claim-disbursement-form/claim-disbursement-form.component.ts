import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ClaimDisbursementComponent } from '../claim-disbursement.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ClaimDisbursementService } from '../../services/claim-disbursement.service';
import * as moment from 'moment';

@Component({
  selector: 'app-claim-disbursement-form',
  templateUrl: './claim-disbursement-form.component.html',
  styleUrls: ['./claim-disbursement-form.component.scss']
})
export class ClaimDisbursementFormComponent implements OnInit {
  form = this.fb.group({
    item_name: [null, Validators.required],
    units: [null, Validators.required],
    price_per_unit: [null, Validators.required],
    date: [null, Validators.required]
  });

  constructor(
    private fb: FormBuilder, 
    private _toastService: ToastService,
    private _claimDisbursementService: ClaimDisbursementService,
    private dialogRef: MatDialogRef<ClaimDisbursementComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.form.patchValue(this.data);
    }

  ngOnInit(): void {
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue: any = { ...this.form.value };
      
      // Convert date to string YYYY-MM-DD
      formValue.date = moment(formValue.date).format('YYYY-MM-DD');

      const request = this.data?.id ?
        this._claimDisbursementService.update(this.data.id, formValue) :
        this._claimDisbursementService.create(formValue);

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
    this._toastService.toastNotification('success', 'Success', val.message);
    this.dialogRef.close(val.data);
  }

  handleError(err: any) {
    this._toastService.toastNotification('danger', 'Failed', err.message);
    console.error(err);
  }
}
