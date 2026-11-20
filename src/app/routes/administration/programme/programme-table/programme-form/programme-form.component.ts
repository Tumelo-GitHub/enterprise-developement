import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';
import { ProgrammeService } from '../../../services/programme.service';
import { GenericCompanyService } from '../../../services/generic-company.service';

@Component({
  selector: 'app-programme-form',
  templateUrl: './programme-form.component.html',
  styleUrls: ['./programme-form.component.scss']
})
export class ProgrammeFormComponent implements OnInit {
  @Input() programmeData: any = null;
  @Input() isEditMode: boolean = false;
  @Output() formSubmit = new EventEmitter<any>();
  @Output() formCancel = new EventEmitter<void>();

  companyList: any[] = [];
  types: any[] = [];
  programmeForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private notification: NotificationUtil,
    private service: ProgrammeService,
    private companyService: GenericCompanyService
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.getGenericCompanyList();
    this.getProgrammeTypes();
    
    if (this.isEditMode && this.programmeData) {
      this.populateForm(this.programmeData);
    }
  }

  buildForm(): void {
    this.programmeForm = this.fb.group({
      programme_name: ['', [Validators.required]],
      programme_type: ['', [Validators.required]],
      description: ['', [Validators.required]],
      generic_company_id: ['', [Validators.required]],
      start_date: ['', [Validators.required]],
      end_date: ['', [Validators.required]]
    });
  }

  populateForm(programme: any): void {
    this.programmeForm.patchValue({
      programme_name: programme.programme_name || '',
      programme_type: programme.programme_type || '',
      description: programme.description || '',
      generic_company_id: programme.generic_company_id || '',
      start_date: programme.start_date || '',
      end_date: programme.end_date || ''
    });
  }

  getGenericCompanyList() {
    this.companyService.getCompanyList().subscribe({
      next: response => {
        this.companyList = response.data;
      },
      error: console.log
    })
  }

  getProgrammeTypes() {
    this.service.getProgrammeTypes().subscribe({
      next: response => {
        this.types = response.data;
      },
      error: console.log
    });
  }

  onSubmit(): void {
    if (this.programmeForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      if (this.isEditMode && this.programmeData?.id) {
        // Update existing programme
        this.service.update(this.programmeData.id, this.programmeForm.value).subscribe({
          next: response => {
            this.notification.showSuccess(response.message || 'Programme updated successfully');
            this.isSubmitting = false;
            this.formSubmit.emit(response.data);
          },
          error: (err) => {
            this.notification.showError(err.message || 'Failed to update programme');
            this.isSubmitting = false;
            console.error(err);
          }
        });
      } else {
        // Create new programme
        this.service.create(this.programmeForm.value).subscribe({
          next: response => {
            this.notification.showSuccess(response.message || 'Programme created successfully');
            this.isSubmitting = false;
            this.formSubmit.emit(response.data);
          },
          error: (err) => {
            this.notification.showError(err.message || 'Failed to create programme');
            this.isSubmitting = false;
            console.error(err);
          }
        });
      }
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  onReset(): void {
    if (this.isEditMode && this.programmeData) {
      this.populateForm(this.programmeData);
    } else {
      this.programmeForm.reset();
    }
  }
}
