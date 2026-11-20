import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { SmmeService } from '../../../services/smme.service';
import { Validators, FormControl, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ProgrammeService } from '../../../services/programme.service';
import { beneficiaries, setBeneficiaries, APPOINTMENT_STATUS } from 'src/app/shared/common/devwizarrd.constants';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';

@Component({
  selector: 'app-appointed-beneficiary-form',
  templateUrl: './appointed-beneficiary-form.component.html',
  styleUrls: ['./appointed-beneficiary-form.component.scss']
})
export class AppointedBeneficiaryFormComponent implements OnInit, OnChanges {
  @Input() data: any = {};
  @Output() formSubmitted = new EventEmitter<any>();
  @Output() formCancelled = new EventEmitter<void>();

  form = this.fb.group({
    programme_id: ['', Validators.required],
    smme_id: ['', Validators.required],
    status: [null, Validators.required],
    appointment_date: ['', Validators.required]
  });

  companyList: any[] = [];
  status = APPOINTMENT_STATUS;
  isLoading = false;

  constructor(
    private smmeService: SmmeService,
    private fb: FormBuilder, 
    public dialog: MatDialog,
    private toast: ToastService,
    private service: ProgrammeService,
    private notificationUtil: NotificationUtil
  ) { }

  ngOnInit(): void {
    this.getBeneficiaryList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      // Convert status to number to match dropdown option IDs
      const formData = { ...this.data };
      if (formData.status) {
        formData.status = Number(formData.status);
      }
      this.form.patchValue(formData);
    }
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

  onCancel(): void {
    this.formCancelled.emit();
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isLoading = true;
      
      const isEditMode = this.data && this.data.id;
      const apiCall = isEditMode 
        ? this.service.updateBeneficiaryAppointment(this.data.id, this.form.value)
        : this.service.appointBeneficiaries(this.form.value);

      apiCall.subscribe({
        next: (response) => {
          this.notificationUtil.showSuccess(response.message);
          this.isLoading = false;
          this.formSubmitted.emit(response.data);
        },
        error: (err: any) => {
          this.notificationUtil.showError(err.message || `Failed to ${isEditMode ? 'update' : 'appoint'} beneficiary`);
          this.isLoading = false;
          console.error(err)
        }
      })
    } else {
      this.notificationUtil.showError('Please fill in all required fields');
    }
  }

}
