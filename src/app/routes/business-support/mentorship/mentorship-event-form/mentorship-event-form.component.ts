import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { IMentorshipEvent } from 'src/app/shared';
import { MENTORSHIP_EVENT_STATUS } from 'src/app/shared/common/devwizarrd.constants';
import { MentorshipEventService } from '../../services/mentorship-event.service';

@Component({
  selector: 'app-mentorship-event-form',
  templateUrl: './mentorship-event-form.component.html',
  styleUrls: ['./mentorship-event-form.component.scss']
})
export class MentorshipEventFormComponent implements OnInit, OnDestroy {

  @Input() mentorshipEvent: IMentorshipEvent | null = null;
  @Input() isEditMode: boolean = false;
  @Output() save = new EventEmitter<Omit<IMentorshipEvent, 'id'> | Partial<IMentorshipEvent>>();
  @Output() cancel = new EventEmitter<void>();

  mentorshipEventForm: FormGroup;
  eventStatusOptions = MENTORSHIP_EVENT_STATUS;
  programmes: any[] = [];
  mentors: any[] = [];
  beneficiaries: any[] = [];
  loading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private mentorshipEventService: MentorshipEventService
  ) {
    this.mentorshipEventForm = this.createForm();
    this.initializeBeneficiaryCheckboxes();
  }

  ngOnInit(): void {
    this.loadDropdownData();
    if (this.mentorshipEvent && this.isEditMode) {
      this.populateForm();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      programme_id: ['', Validators.required],
      mentor_id: ['', Validators.required],
      address: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      event_date: ['', Validators.required],
      event_time: ['', Validators.required],
      status: ['1', Validators.required],
      beneficiaries: this.fb.array([], [this.minSelectedCheckboxes])
    });
  }

  private loadDropdownData(): void {
    this.loading = true;

    // Load programmes
    this.mentorshipEventService.getProgrammes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.programmes = response.data || [];
        },
        error: (error) => {
          console.error('Error loading programmes:', error);
        }
      });

    // Load mentors (service providers with service type 2 = Mentor)
    this.mentorshipEventService.getMentors()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.mentors = response.data || [];
        },
        error: (error) => {
          console.error('Error loading mentors:', error);
        }
      });

    // Load beneficiaries
    this.mentorshipEventService.getBeneficiaries()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.beneficiaries = response.data || [];
          this.initializeBeneficiaryCheckboxes();
        },
        error: (error) => {
          console.error('Error loading beneficiaries:', error);
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  private populateForm(): void {
    if (this.mentorshipEvent) {
      this.mentorshipEventForm.patchValue({
        programme_id: this.mentorshipEvent.programme_id,
        mentor_id: this.mentorshipEvent.mentor_id,
        address: this.mentorshipEvent.address,
        event_date: this.mentorshipEvent.event_date,
        event_time: this.mentorshipEvent.event_time,
        status: this.mentorshipEvent.status.toString()
      });

      // Set beneficiary checkboxes
      this.setBeneficiaryCheckboxes(this.mentorshipEvent.beneficiaries);
    }
  }

  private setBeneficiaryCheckboxes(selectedBeneficiaries: number[]): void {
    const beneficiaryFormArray = this.mentorshipEventForm.get('beneficiaries') as FormArray;
    beneficiaryFormArray.clear();

    this.beneficiaries.forEach(beneficiary => {
      const isSelected = selectedBeneficiaries.includes(parseInt(beneficiary.id));
      beneficiaryFormArray.push(new FormControl(isSelected));
    });
  }

  private initializeBeneficiaryCheckboxes(): void {
    const beneficiaryFormArray = this.mentorshipEventForm.get('beneficiaries') as FormArray;
    beneficiaryFormArray.clear();
    this.beneficiaries.forEach(() => {
      beneficiaryFormArray.push(new FormControl(false));
    });
  }

  onBeneficiaryChange(index: number, event: any): void {
    const beneficiaryFormArray = this.mentorshipEventForm.get('beneficiaries') as FormArray;
    beneficiaryFormArray.at(index).setValue(event.checked);
  }

  private getSelectedBeneficiaries(): number[] {
    const beneficiaryFormArray = this.mentorshipEventForm.get('beneficiaries') as FormArray;
    return this.beneficiaries
      .map((beneficiary, index) => beneficiaryFormArray.at(index).value ? parseInt(beneficiary.id) : null)
      .filter(value => value !== null) as number[];
  }

  onSubmit(): void {
    if (this.mentorshipEventForm.valid) {
      const formValue = this.mentorshipEventForm.value;
      const selectedBeneficiaries = this.getSelectedBeneficiaries();

      const finalData = {
        programme_id: parseInt(formValue.programme_id),
        mentor_id: parseInt(formValue.mentor_id),
        address: formValue.address,
        event_date: formValue.event_date,
        event_time: formValue.event_time,
        status: parseInt(formValue.status),
        beneficiaries: selectedBeneficiaries
      };

      if (this.isEditMode && this.mentorshipEvent) {
        this.save.emit({ id: this.mentorshipEvent.id, ...finalData });
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
    this.mentorshipEventForm.reset();
    this.mentorshipEventForm.patchValue({ status: '1' });
    this.initializeBeneficiaryCheckboxes();
    if (this.isEditMode && this.mentorshipEvent) {
      this.populateForm();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.mentorshipEventForm.controls).forEach(key => {
      const control = this.mentorshipEventForm.get(key);
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
  get programme_id() { return this.mentorshipEventForm.get('programme_id'); }
  get mentor_id() { return this.mentorshipEventForm.get('mentor_id'); }
  get address() { return this.mentorshipEventForm.get('address'); }
  get event_date() { return this.mentorshipEventForm.get('event_date'); }
  get event_time() { return this.mentorshipEventForm.get('event_time'); }
  get status() { return this.mentorshipEventForm.get('status'); }
  get beneficiaries_control() { return this.mentorshipEventForm.get('beneficiaries') as FormArray; }

  // Helper methods for validation messages
  getErrorMessage(fieldName: string): string {
    const control = this.mentorshipEventForm.get(fieldName);
    if (control && control.errors && control.touched) {
      const errors = control.errors;
      
      if (errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required.`;
      }
      if (errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${errors['minlength'].requiredLength} characters.`;
      }
      if (errors['maxlength']) {
        return `${this.getFieldDisplayName(fieldName)} cannot exceed ${errors['maxlength'].requiredLength} characters.`;
      }
      if (errors['minSelected']) {
        return 'Please select at least one beneficiary.';
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      'programme_id': 'Programme',
      'mentor_id': 'Mentor',
      'address': 'Event Address',
      'event_date': 'Event Date',
      'event_time': 'Event Time',
      'status': 'Status',
      'beneficiaries': 'Beneficiaries'
    };
    return fieldNames[fieldName] || fieldName;
  }

  // Helper method to get programme name
  getProgrammeName(programmeId: number): string {
    const programme = this.programmes.find(p => p.id === programmeId);
    return programme ? programme.programme_name : '';
  }

  // Helper method to get mentor name
  getMentorName(mentorId: number): string {
    const mentor = this.mentors.find(m => m.id === mentorId);
    return mentor ? `${mentor.name} ${mentor.surname}` : '';
  }

  // Helper method to get status name
  getStatusName(statusId: string): string {
    const status = this.eventStatusOptions.find(s => s.id === statusId);
    return status ? status.status_name : '';
  }

}
