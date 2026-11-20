import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationUtil } from '../../utils/notificationUtil';

@Component({
  selector: 'app-company-employee-form',
  templateUrl: './company-employee-form.component.html',
  styleUrls: ['./company-employee-form.component.scss']
})
export class CompanyEmployeeFormComponent implements OnInit, OnChanges {
  @Input() employee: any = null;
  @Input() companyId!: number;
  @Input() isEditMode: boolean = false;
  @Input() employeeService: any; // Service to create/update employees
  @Output() formSubmit = new EventEmitter<any>();
  @Output() formCancel = new EventEmitter<void>();

  employeeForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private notification: NotificationUtil
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.setupForm();
  }

  ngOnChanges(): void {
    if (this.employeeForm) {
      this.setupForm();
    }
  }

  buildForm(): void {
    this.employeeForm = this.fb.group({
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      position: [''],
      role: [''],
      cell_number: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      company: [this.companyId, [Validators.required]]
    });
  }

  setupForm(): void {
    this.employeeForm.patchValue({ company: this.companyId });
    
    if (this.isEditMode && this.employee) {
      this.employeeForm.patchValue(this.employee);
    }
  }

  onSubmit(): void {
    if (this.employeeForm.valid && !this.isSubmitting && this.employeeService) {
      this.isSubmitting = true;
      const formData = this.employeeForm.value;
      
      if (this.isEditMode && this.employee?.id) {
        // Update existing record
        this.employeeService.update(this.employee.id, formData).subscribe({
          next: (val: any) => {
            this.notification.showSuccess(val.message || 'Employee updated successfully');
            this.formSubmit.emit(val.data || formData);
            this.isSubmitting = false;
          },
          error: (err: any) => {
            this.notification.showError(err.message || 'Failed to update employee');
            console.error(err);
            this.isSubmitting = false;
          }
        });
      } else {
        // Create new record
        this.employeeService.create(formData).subscribe({
          next: (val: any) => {
            this.notification.showSuccess(val.message || 'Employee created successfully');
            this.formSubmit.emit(val.data || formData);
            this.isSubmitting = false;
          },
          error: (err: any) => {
            this.notification.showError(err.message || 'Failed to create employee');
            console.error(err);
            this.isSubmitting = false;
          }
        });
      }
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  onReset(): void {
    if (this.isEditMode && this.employee) {
      this.employeeForm.patchValue(this.employee);
    } else {
      this.employeeForm.reset();
      this.employeeForm.patchValue({ company: this.companyId });
    }
  }
}
