import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { GenericCompanyService } from '../../services/generic-company.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';

@Component({
  selector: 'app-generic-company-form',
  templateUrl: './generic-company-form.component.html',
  styleUrls: ['./generic-company-form.component.scss']
})
export class GenericCompanyFormComponent implements OnInit, OnChanges {
  @Input() companyData: any = null;
  @Input() isEditMode = false;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  loading = false;

  companyForm = this.fb.group({
    company_name: [null, Validators.required],
    physical_address: [null, Validators.required],
    postal_address: null,
    dept_name: [null, Validators.required],
    dept_address: [null, Validators.required],
    contact_name: [null, Validators.required],
    contact_surname: [null, Validators.required],
    contact_email: [null, [Validators.required, Validators.email]],
    contact_cell: [null, Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private _companyService: GenericCompanyService,
    private toast: ToastService,
    private notificationUtil: NotificationUtil
  ) { }

  ngOnInit(): void {
    if (this.isEditMode && this.companyData) {
      this.populateForm();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['companyData'] && this.companyData) {
      this.populateForm();
    }
  }

  populateForm(): void {
    if (this.companyData) {
      this.companyForm.patchValue(this.companyData);
    }
  }

  onSubmit(): void {
    if (this.companyForm.invalid) {
      this.markFormGroupTouched();
      this.notificationUtil.showError('Please fill in all required fields correctly');
      return;
    }

    this.loading = true;
    const formData = this.companyForm.value;

    // Emit the form data to parent component
    this.save.emit(formData);
    this.loading = false;
    this.companyForm.reset();
  }

  onCancel(): void {
    this.companyForm.reset();
    this.cancel.emit();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.companyForm.controls).forEach(key => {
      const control = this.companyForm.get(key);
      control?.markAsTouched();
    });
  }
}
