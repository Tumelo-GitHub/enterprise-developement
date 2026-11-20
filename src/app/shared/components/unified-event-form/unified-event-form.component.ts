import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Subject, takeUntil, Observable, forkJoin } from 'rxjs';
import { 
  IMentorshipEvent, 
  ICoachingEvent, 
  IProgramme, 
  IUnifiedEvent,
  IEventFormConfig
} from '../../interfaces';
import { MentorshipEventService } from '../../../routes/business-support/services/mentorship-event.service';
import { CoachingEventService } from '../../../routes/business-support/services/coaching-event.service';
import { MENTORSHIP_EVENT_STATUS } from '../../common/devwizarrd.constants';
import { COACHING_EVENT_STATUS } from '../../common/coaching.constants';

@Component({
  selector: 'app-unified-event-form',
  templateUrl: './unified-event-form.component.html',
  styleUrls: ['./unified-event-form.component.scss']
})
export class UnifiedEventFormComponent implements OnInit, OnDestroy {
  @Input() eventType: 'mentorship' | 'coaching' = 'mentorship';
  @Input() eventData: IMentorshipEvent | ICoachingEvent | null = null;
  @Input() isEditMode: boolean = false;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  eventForm: FormGroup;
  programmes: IProgramme[] = [];
  providers: any[] = []; // mentors or coaches
  participants: any[] = []; // beneficiaries or SMMEs
  statusOptions: { value: number, label: string }[] = [];
  formConfig: IEventFormConfig;
  
  isLoading = true;
  isSubmitting = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private mentorshipEventService: MentorshipEventService,
    private coachingEventService: CoachingEventService
  ) {
    this.eventForm = this.createForm();
    this.formConfig = this.getFormConfig();
  }

  ngOnInit(): void {
    this.formConfig = this.getFormConfig();
    this.loadFormData();
    this.loadStatusOptions();
    
    if (this.eventData && this.isEditMode) {
      this.populateForm();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      programme_id: ['', [Validators.required]],
      provider_id: ['', [Validators.required]], // generic field for mentor_id or coach_id
      address: ['', [Validators.required, Validators.maxLength(255)]],
      event_date: ['', [Validators.required]],
      event_time: ['', [Validators.required]],
      status: [this.getDefaultStatus(), [Validators.required]],
      participants: this.fb.array([]) // generic field for beneficiaries or smme
    });
  }

  private getFormConfig(): IEventFormConfig {
    if (this.eventType === 'coaching') {
      return {
        eventType: 'coaching',
        providerLabel: 'Coach',
        participantLabel: 'SMMEs',
        participantIcon: 'business',
        eventIcon: 'sports_basketball'
      };
    } else {
      return {
        eventType: 'mentorship',
        providerLabel: 'Mentor',
        participantLabel: 'Beneficiaries',
        participantIcon: 'people',
        eventIcon: 'event'
      };
    }
  }

  private getDefaultStatus(): number {
    return this.eventType === 'coaching' ? COACHING_EVENT_STATUS.SCHEDULED : 1; // Default to scheduled
  }

  private loadStatusOptions(): void {
    if (this.eventType === 'coaching') {
      this.statusOptions = this.coachingEventService.getStatusOptions();
    } else {
      // Convert mentorship status array to options format
      this.statusOptions = MENTORSHIP_EVENT_STATUS.map(status => ({
        value: parseInt(status.id),
        label: status.status_name
      }));
    }
  }

  private loadFormData(): void {
    this.isLoading = true;
    
    let dataObservables: Observable<any>[];

    if (this.eventType === 'coaching') {
      dataObservables = [
        this.coachingEventService.getAllProgrammes(),
        this.coachingEventService.getAllCoaches(),
        this.coachingEventService.getAllSmmes()
      ];
    } else {
      dataObservables = [
        this.mentorshipEventService.getProgrammes(),
        this.mentorshipEventService.getMentors(),
        this.mentorshipEventService.getBeneficiaries()
      ];
    }

    forkJoin(dataObservables)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([programmesResponse, providersResponse, participantsResponse]) => {
          this.programmes = programmesResponse.data || [];
          this.providers = providersResponse.data || [];
          this.participants = participantsResponse.data || [];
          
          this.setupParticipantCheckboxes();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading form data:', error);
          this.isLoading = false;
        }
      });
  }

  private setupParticipantCheckboxes(): void {
    const participantsFormArray = this.eventForm.get('participants') as FormArray;
    participantsFormArray.clear();
    
    this.participants.forEach(() => {
      participantsFormArray.push(this.fb.control(false));
    });
  }

  private populateForm(): void {
    if (!this.eventData) return;

    // Map the data based on event type
    const providerField = this.eventType === 'coaching' ? 'coach_id' : 'mentor_id';
    const participantField = this.eventType === 'coaching' ? 'smme' : 'beneficiaries';

    this.eventForm.patchValue({
      programme_id: this.eventData.programme_id,
      provider_id: (this.eventData as any)[providerField],
      address: this.eventData.address,
      event_date: this.eventData.event_date,
      event_time: this.eventData.event_time,
      status: this.eventData.status
    });

    // Set participant selections
    const participantsFormArray = this.eventForm.get('participants') as FormArray;
    const selectedParticipants = (this.eventData as any)[participantField] || [];
    
    if (selectedParticipants.length > 0) {
      this.participants.forEach((participant, index) => {
        const isSelected = selectedParticipants.includes(participant.id);
        participantsFormArray.at(index)?.setValue(isSelected);
      });
    }
  }

  get participants_control(): FormArray {
    return this.eventForm.get('participants') as FormArray;
  }

  onSubmit(): void {
    if (this.eventForm.valid && this.validateParticipantSelection()) {
      this.isSubmitting = true;
      
      const formValue = this.eventForm.value;
      const selectedParticipants: number[] = [];
      
      formValue.participants.forEach((isSelected: boolean, index: number) => {
        if (isSelected && this.participants[index]) {
          selectedParticipants.push(this.participants[index].id);
        }
      });

      // Map back to the appropriate field names
      const eventData: any = {
        programme_id: formValue.programme_id,
        address: formValue.address,
        event_date: formValue.event_date,
        event_time: formValue.event_time,
        status: formValue.status
      };

      if (this.eventType === 'coaching') {
        eventData.coach_id = formValue.provider_id;
        eventData.smme = selectedParticipants;
      } else {
        eventData.mentor_id = formValue.provider_id;
        eventData.beneficiaries = selectedParticipants;
      }

      this.save.emit(eventData);
      this.isSubmitting = false;
    } else {
      this.markFormGroupTouched(this.eventForm);
    }
  }

  public validateParticipantSelection(): boolean {
    const selectedCount = this.participants_control.controls
      .filter(control => control.value === true).length;
    return selectedCount >= 1;
  }

  onReset(): void {
    this.eventForm.reset();
    this.eventForm.patchValue({
      status: this.getDefaultStatus()
    });
    this.setupParticipantCheckboxes();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.eventForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.eventForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${this.getFieldDisplayName(fieldName)} is required`;
      if (field.errors['maxlength']) return `${this.getFieldDisplayName(fieldName)} is too long`;
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'programme_id': 'Programme',
      'provider_id': this.formConfig.providerLabel,
      'address': 'Address',
      'event_date': 'Event Date',
      'event_time': 'Event Time',
      'status': 'Status'
    };
    return displayNames[fieldName] || fieldName.replace('_', ' ');
  }

  getProviderName(providerId: number): string {
    const provider = this.providers.find(p => p.id === providerId);
    return provider ? `${provider.name} ${provider.surname}` : '';
  }

  getProgrammeName(programmeId: number): string {
    const programme = this.programmes.find(p => p.id === programmeId);
    return programme ? programme.programme_name : '';
  }

  getParticipantDisplayName(participant: any): string {
    if (this.eventType === 'coaching') {
      return participant.smme_name || `SMME ${participant.id}`;
    } else {
      return participant.name || participant.smme_name || `Beneficiary ${participant.id}`;
    }
  }

  getParticipantDetails(participant: any): string {
    if (this.eventType === 'coaching') {
      return `${participant.products || 'Business'} | ${participant.address?.city || 'Unknown Location'}`;
    } else {
      return participant.smme_name || 'Individual Beneficiary';
    }
  }
}