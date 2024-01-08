import { Component, Inject, OnInit } from '@angular/core';
import { SmmeService } from '../../../services/smme.service';
import { Validators, FormControl, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ProgrammeService } from '../../../services/programme.service';
import { beneficiaries, setBeneficiaries, APPOINTMENT_STATUS } from 'src/app/shared/common/devwizarrd.constants';

@Component({
  selector: 'app-appointed-beneficiary-form',
  templateUrl: './appointed-beneficiary-form.component.html',
  styleUrls: ['./appointed-beneficiary-form.component.scss']
})
export class AppointedBeneficiaryFormComponent implements OnInit {
  form = this.fb.group({
    programme_id: [this.data.programme_id, Validators.required],
    smme_id: ['', Validators.required],
    status: [null, Validators.required],
    appointment_date: ['', Validators.required]
  });

  companyList: any[] = [];
  status = APPOINTMENT_STATUS;

  constructor(
    private smmeService: SmmeService,
    private fb: FormBuilder, 
    public dialog: MatDialog,
    private toast: ToastService,
    private dialogRef: MatDialogRef<AppointedBeneficiaryFormComponent>,
    private service: ProgrammeService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.getBeneficiaryList();
    this.form.patchValue(this.data);
  }

  getBeneficiaryList() {
    if(beneficiaries.length == 0) {
      this.smmeService.getSmme().subscribe({
        next: (resp) => {
          this.companyList = resp.data;
          setBeneficiaries(this.companyList);
        },
        error: (err) => {
          console.log(err)
        }
      })
    } else {
      this.companyList = beneficiaries;
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.service.appointBeneficiaries(this.form.value).subscribe({
        next: (response) => {
          this.toast.toastNotification('success', 'Success', response.message);
          this.dialogRef.close(response.data);
        },
        error: (err: any) => {
          this.toast.toastNotification('danger', 'Failed', err.message);
            console.error(err)
        }
      })
    }
  }

}
