import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BdspService } from '../../../services/bdsp.service';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';
import { IBDSP } from 'src/app/shared';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-bdsp-form',
  templateUrl: './bdsp-form.component.html',
  styleUrls: ['./bdsp-form.component.scss']
})
export class BdspFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  @Input() companyData: IBDSP | null = null;
  @Input() isEditMode = false;
  @Output() save = new EventEmitter<IBDSP>();
  @Output() cancel = new EventEmitter<void>();

  isSubmitting = false;

  bdspForm = this.fb.group({
    bdsp_name: ['', Validators.required],
    physical_address: ['', Validators.required],
    postal_address: ['', Validators.required],
    tell_number: [''],
    cell_number: [''],
    email: [''],
    description: ['', Validators.required],
    products: [''],
    registration: [''],
    tax_number: ['', Validators.required],
    bbbee_level: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder, 
    private bdspService: BdspService,
    private notificationUtil: NotificationUtil
  ) { }

  ngOnInit(): void {
    if (this.companyData && this.isEditMode) {
      this.bdspForm.patchValue({
        ...this.companyData,
        bbbee_level: this.companyData.bbbee_level?.toString() || ''
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.bdspForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData = this.bdspForm.value;

      if (this.isEditMode && this.companyData) {
        // Update existing record
        this.bdspService.update(this.companyData.id, formData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response: any) => {
              this.notificationUtil.showSuccess(response.message || 'Company updated successfully');
              this.isSubmitting = false;
              this.save.emit(response.data);
            },
            error: (error: any) => {
              this.notificationUtil.showError(error.message || 'Failed to update company');
              this.isSubmitting = false;
              console.error(error);
            }
          });
      } else {
        // Add new record
        this.bdspService.create(formData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response: any) => {
              this.notificationUtil.showSuccess(response.message || 'Company created successfully');
              this.isSubmitting = false;
              this.save.emit(response.data);
            },
            error: (error: any) => {
              this.notificationUtil.showError(error.message || 'Failed to create company');
              this.isSubmitting = false;
              console.error(error);
            }
          });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onReset(): void {
    if (this.isEditMode && this.companyData) {
      this.bdspForm.patchValue({
        ...this.companyData,
        bbbee_level: this.companyData.bbbee_level?.toString() || ''
      });
    } else {
      this.bdspForm.reset();
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.bdspForm.controls).forEach(key => {
      const control = this.bdspForm.get(key);
      control?.markAsTouched();
    });
  }
}
