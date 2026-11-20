import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ComplianceService } from '../../../services/compliance.service';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';
import * as _moment from 'moment';
import { IComplianceStatus, IComplianceType } from 'src/app/shared';

const moment = _moment;

@Component({
  selector: 'app-compliance-form',
  templateUrl: './compliance-form.component.html',
  styleUrls: ['./compliance-form.component.scss']
})
export class ComplianceFormComponent implements OnInit {
  @Input() complianceData: any = null;
  @Input() companyId: any = null;
  @Input() statuses: IComplianceStatus[] = [];
  @Input() types: IComplianceType[] = [];
  @Output() formSubmitted = new EventEmitter<any>();
  @Output() formCancelled = new EventEmitter<void>();

  isEditMode = false;
  isSubmitting = false;
  selectedFileName: string = '';

  complianceForm = this.fb.group({
    type_id: ['', Validators.required],
    registration_num: ['', Validators.required],
    smme_id: [null, Validators.required],
    issued_date: ['', Validators.required],
    expiry_date: ['', Validators.required],
    status: ['', Validators.required],
    isVerified: [''],
    verified_person: [''],
    file: ['']
  });

  constructor(
    private fb: FormBuilder, 
    private complianceService: ComplianceService,
    private notification: NotificationUtil
  ) { }

  ngOnInit(): void {
    // Set company ID
    if (this.companyId) {
      this.complianceForm.patchValue({ smme_id: this.companyId });
    }

    // Check if we're editing existing compliance data
    if (this.complianceData && this.complianceData.id) {
      this.isEditMode = true;
      this.populateForm();
    }
  }

  populateForm(): void {
    if (this.complianceData) {
      this.complianceForm.patchValue({
        type_id: this.complianceData.type_id,
        registration_num: this.complianceData.registration_num,
        smme_id: this.complianceData.smme_id || this.companyId,
        issued_date: this.complianceData.issued_date,
        expiry_date: this.complianceData.expiry_date,
        status: this.complianceData.status,
        isVerified: this.complianceData.isVerified,
        verified_person: this.complianceData.verified_person
      });
    }
  }

  onFileSelect(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedFileName = file.name;
      this.complianceForm.controls.file.setValue(file);
    }
  }

  removeFile(): void {
    this.selectedFileName = '';
    this.complianceForm.controls.file.setValue('');
  }

  onReset(): void {
    this.complianceForm.reset();
    this.selectedFileName = '';
    if (this.companyId) {
      this.complianceForm.patchValue({ smme_id: this.companyId });
    }
    if (this.isEditMode) {
      this.populateForm();
    }
  }

  onCancel(): void {
    this.formCancelled.emit();
  }

  onSubmit(): void {
    if (this.complianceForm.valid) {
      this.isSubmitting = true;
      
      // Format dates
      const formValue = { ...this.complianceForm.value };
      formValue.issued_date = moment(formValue.issued_date).format('YYYY-MM-DD');
      formValue.expiry_date = moment(formValue.expiry_date).format('YYYY-MM-DD');

      // Create FormData for file upload
      const formData: any = new FormData();
      formData.append('type_id', formValue.type_id);
      formData.append('registration_num', formValue.registration_num);
      formData.append('smme_id', formValue.smme_id);
      formData.append('issued_date', formValue.issued_date);
      formData.append('expiry_date', formValue.expiry_date);
      formData.append('status', formValue.status);
      formData.append('isVerified', formValue.isVerified || '');
      formData.append('verified_person', formValue.verified_person || '');
      
      if (formValue.file) {
        formData.append('file', formValue.file);
      }

      if (this.isEditMode && this.complianceData.id) {
        // Add document ID if exists
        if (this.complianceData.docid) {
          formData.append('docid', this.complianceData.docid);
        }
        
        // Update existing record
        this.complianceService.update(this.complianceData.id, formData).subscribe({
          next: (response) => {
            this.notification.showSuccess(response.message || 'Compliance updated successfully');
            this.isSubmitting = false;
            this.formSubmitted.emit(response.data);
          },
          error: (error) => {
            this.notification.showError(error.message || 'Failed to update compliance');
            this.isSubmitting = false;
          }
        });
      } else {
        // Add new record
        this.complianceService.create(formData).subscribe({
          next: (response) => {
            this.notification.showSuccess(response.message || 'Compliance created successfully');
            this.isSubmitting = false;
            this.formSubmitted.emit(response.data);
          },
          error: (error) => {
            this.notification.showError(error.message || 'Failed to create compliance');
            this.isSubmitting = false;
          }
        });
      }
    }
  }
}
