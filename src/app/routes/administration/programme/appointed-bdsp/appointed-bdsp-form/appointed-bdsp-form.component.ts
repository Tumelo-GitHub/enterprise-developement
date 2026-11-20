import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { BdspService } from '../../../services/bdsp.service';
import { IBDSP } from 'src/app/shared';
import { Validators, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from 'src/app/shared/services/toast.service';
import { BdspAppointmentService } from '../../../services/bdsp-appointment.service';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';

@Component({
  selector: 'app-appointed-bdsp-form',
  templateUrl: './appointed-bdsp-form.component.html',
  styleUrls: ['./appointed-bdsp-form.component.scss']
})
export class AppointedBdspFormComponent implements OnInit, OnChanges {
  @Input() data: any = {};
  @Output() formSubmitted = new EventEmitter<any>();
  @Output() formCancelled = new EventEmitter<void>();

  form = this.fb.group({
    programme_id: ['', Validators.required],
    bdsp_id: [null, Validators.required],
    appointment_date: ['', Validators.required],
    contract_start_date: ['', Validators.required],
    contract_end_date: ['', Validators.required],
    // service_request_start_date: [null],
    // service_request_end_date: [null],
    description: [null]
  });

  companyList: IBDSP[] = [];
  isLoading = false;

  constructor(
    private bdspService: BdspService,
    private fb: FormBuilder, 
    public dialog: MatDialog,
    private toast: ToastService,
    private service: BdspAppointmentService,
    private notificationUtil: NotificationUtil
  ) { }

  ngOnInit(): void {
    this.getCompanyList();
    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.form.patchValue(this.data);
    }
  }

  getCompanyList() {
    this.bdspService.getBdsp().subscribe({
      next: (resp) => {
        this.companyList = resp.data;
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  onCancel(): void {
    this.formCancelled.emit();
  }

  onSubmit(): void {
    console.log(this.form.value)
    if (!this.form.valid) {
      this.notificationUtil.showError('Please fill in all required fields');
      return;
    }

    this.isLoading = true;
    if (this.data.id) {
      this.service.update(this.data.id, this.form.value).subscribe({
        next: response => {
          console.log(response)
          this.notificationUtil.showSuccess(response.message);
          this.isLoading = false;
          this.formSubmitted.emit(response.data);
        },
        error: err => {
          this.notificationUtil.showError(err.message || 'Failed to update BDSP appointment');
          this.isLoading = false;
          console.log(err)
        }
      });
    } else {
      this.service.create(this.form.value).subscribe({
        next: response => {
          this.notificationUtil.showSuccess(response.message);
          this.isLoading = false;
          this.formSubmitted.emit(response.data);
        },
        error: err => {
          this.notificationUtil.showError(err.message || 'Failed to appoint BDSP');
          this.isLoading = false;
          console.log(err)
        }
      });
    }
  }

}
