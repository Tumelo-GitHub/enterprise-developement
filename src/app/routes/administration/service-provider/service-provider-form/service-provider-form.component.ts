import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { IServiceProvider } from 'src/app/shared';
import { SERVICE_TYPE } from 'src/app/shared/common/devwizarrd.constants';

@Component({
  selector: 'app-service-provider-form',
  templateUrl: './service-provider-form.component.html',
  styleUrls: ['./service-provider-form.component.scss']
})
export class ServiceProviderFormComponent implements OnInit {

  @Input() serviceProvider: IServiceProvider | null = null;
  @Input() isEditMode: boolean = false;
  @Output() save = new EventEmitter<Omit<IServiceProvider, 'id'> | Partial<IServiceProvider>>();
  @Output() cancel = new EventEmitter<void>();

  serviceProviderForm: FormGroup;
  serviceTypes = SERVICE_TYPE;

  constructor(private fb: FormBuilder) {
    this.serviceProviderForm = this.createForm();
    this.initializeServiceTypeCheckboxes();
  }

  ngOnInit(): void {
    if (this.serviceProvider && this.isEditMode) {
      this.populateForm();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      surname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      tel_number: ['', [Validators.pattern(/^[0-9\-\+\(\)\s]+$/), Validators.maxLength(20)]],
      cell_number: ['', [Validators.required, Validators.pattern(/^[0-9\-\+\(\)\s]+$/), Validators.maxLength(20)]],
      qualification: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      specialization: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      service_type: this.fb.array([], this.minSelectedCheckboxes.bind(this))
    });
  }

  private populateForm(): void {
    if (this.serviceProvider) {
      this.serviceProviderForm.patchValue({
        name: this.serviceProvider.name,
        surname: this.serviceProvider.surname,
        email: this.serviceProvider.email,
        tel_number: this.serviceProvider.tel_number,
        cell_number: this.serviceProvider.cell_number,
        qualification: this.serviceProvider.qualification,
        specialization: this.serviceProvider.specialization
      });

      // Set service type checkboxes
      this.setServiceTypeCheckboxes(this.serviceProvider.service_type);
    }
  }

  private setServiceTypeCheckboxes(serviceTypes: number[] | string[]): void {
    const serviceTypeFormArray = this.serviceProviderForm.get('service_type') as FormArray;
    serviceTypeFormArray.clear();

    this.serviceTypes.forEach(serviceType => {
      // Convert both to strings for comparison since backend may return strings or numbers
      const serviceTypeId = String(serviceType.id);
      const isSelected = serviceTypes.some(type => String(type) === serviceTypeId);
      serviceTypeFormArray.push(new FormControl(isSelected));
    });
    
    // Update the form array's status to trigger form validation
    serviceTypeFormArray.updateValueAndValidity();
  }

  private getSelectedServiceTypes(): number[] {
    const serviceTypeFormArray = this.serviceProviderForm.get('service_type') as FormArray;
    return this.serviceTypes
      .map((serviceType, index) => serviceTypeFormArray.at(index).value ? parseInt(serviceType.id) : null)
      .filter(value => value !== null) as number[];
  }

  onSubmit(): void {
    if (this.serviceProviderForm.valid) {
      const formValue = this.serviceProviderForm.value;
      const serviceTypes = this.getSelectedServiceTypes();

      const serviceProviderData = {
        ...formValue,
        service_type: serviceTypes
      };

      // Remove the form array from the data since we're using the processed serviceTypes
      delete serviceProviderData.service_type;

      const finalData = {
        name: formValue.name,
        surname: formValue.surname,
        email: formValue.email,
        tel_number: formValue.tel_number,
        cell_number: formValue.cell_number,
        qualification: formValue.qualification,
        specialization: formValue.specialization,
        service_type: serviceTypes
      };

      if (this.isEditMode && this.serviceProvider) {
        this.save.emit({ id: this.serviceProvider.id, ...finalData });
      } else {
        this.save.emit(finalData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onReset(): void {
    this.serviceProviderForm.reset();
    this.initializeServiceTypeCheckboxes();
    if (this.isEditMode && this.serviceProvider) {
      this.populateForm();
    }
  }

  private initializeServiceTypeCheckboxes(): void {
    const serviceTypeFormArray = this.serviceProviderForm.get('service_type') as FormArray;
    serviceTypeFormArray.clear();
    this.serviceTypes.forEach(() => {
      serviceTypeFormArray.push(new FormControl(false));
    });
    // Update the form array's status to trigger form validation
    serviceTypeFormArray.updateValueAndValidity();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.serviceProviderForm.controls).forEach(key => {
      const control = this.serviceProviderForm.get(key);
      if (control) {
        control.markAsTouched();
        if (control instanceof FormArray) {
          control.controls.forEach(c => c.markAsTouched());
        }
      }
    });
  }

  private minSelectedCheckboxes(control: any) {
    if (control instanceof FormArray) {
      const selectedCount = control.controls
        .map(ctrl => ctrl.value)
        .reduce((prev, next) => next ? prev + 1 : prev, 0);

      return selectedCount >= 1 ? null : { minSelected: true };
    }
    return null;
  }

  // Getters for easy access in template
  get name() { return this.serviceProviderForm.get('name'); }
  get surname() { return this.serviceProviderForm.get('surname'); }
  get email() { return this.serviceProviderForm.get('email'); }
  get tel_number() { return this.serviceProviderForm.get('tel_number'); }
  get cell_number() { return this.serviceProviderForm.get('cell_number'); }
  get qualification() { return this.serviceProviderForm.get('qualification'); }
  get specialization() { return this.serviceProviderForm.get('specialization'); }
  get service_type() { return this.serviceProviderForm.get('service_type') as FormArray; }

  // Helper methods for validation messages
  getErrorMessage(fieldName: string): string {
    const control = this.serviceProviderForm.get(fieldName);
    if (control && control.errors && control.touched) {
      const errors = control.errors;
      
      if (errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required.`;
      }
      if (errors['email']) {
        return 'Please enter a valid email address.';
      }
      if (errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${errors['minlength'].requiredLength} characters.`;
      }
      if (errors['maxlength']) {
        return `${this.getFieldDisplayName(fieldName)} cannot exceed ${errors['maxlength'].requiredLength} characters.`;
      }
      if (errors['pattern']) {
        return `${this.getFieldDisplayName(fieldName)} format is invalid.`;
      }
      if (errors['minSelected']) {
        return 'Please select at least one service type.';
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      'name': 'First Name',
      'surname': 'Last Name',
      'email': 'Email',
      'tel_number': 'Telephone Number',
      'cell_number': 'Cell Number',
      'qualification': 'Qualification',
      'specialization': 'Specialization',
      'service_type': 'Service Type'
    };
    return fieldNames[fieldName] || fieldName;
  }

  // Helper method to get service type name
  getServiceTypeName(serviceTypeId: string): string {
    const serviceType = this.serviceTypes.find(st => st.id === serviceTypeId);
    return serviceType ? serviceType.type_name : '';
  }
}