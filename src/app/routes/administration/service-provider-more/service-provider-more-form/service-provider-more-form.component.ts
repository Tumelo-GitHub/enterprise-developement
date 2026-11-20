import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IMoreServiceProvider } from 'src/app/shared';

type MoreServiceProviderPayload = Omit<IMoreServiceProvider, 'id'>;

@Component({
  selector: 'app-service-provider-more-form',
  templateUrl: './service-provider-more-form.component.html',
  styleUrls: ['./service-provider-more-form.component.scss']
})
export class ServiceProviderMoreFormComponent implements OnChanges {
  @Input() provider: IMoreServiceProvider | null = null;
  @Input() isEditMode = false;
  @Output() save = new EventEmitter<MoreServiceProviderPayload | Partial<IMoreServiceProvider>>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      surname: ['', [Validators.required, Validators.maxLength(100)]],
      company_name: ['', [Validators.required, Validators.maxLength(150)]],
      city: ['', [Validators.required, Validators.maxLength(100)]],
      province: ['', [Validators.required, Validators.maxLength(100)]],
      tel_no: ['', [Validators.required, Validators.maxLength(30)]],
      cell_no: ['', [Validators.required, Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      service_type: ['', [Validators.required, Validators.maxLength(100)]],
      comment: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['provider'] || changes['isEditMode']) && this.provider && this.isEditMode) {
      this.form.patchValue({
        name: this.provider.name,
        surname: this.provider.surname,
        company_name: this.provider.company_name,
        city: this.provider.city,
        province: this.provider.province,
        tel_no: this.provider.tel_no,
        cell_no: this.provider.cell_no,
        email: this.provider.email,
        service_type: this.provider.service_type,
        comment: this.provider.comment
      });
    }

    if ((changes['provider'] || changes['isEditMode']) && !this.provider && !this.isEditMode) {
      this.form.reset();
    }
  }

  onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.value as MoreServiceProviderPayload;

    if (this.isEditMode && this.provider) {
      this.save.emit({ id: this.provider.id, ...payload });
      return;
    }

    this.save.emit(payload);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
