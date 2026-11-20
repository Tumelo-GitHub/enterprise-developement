import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { TrainingEventInvitationService, ITrainingEventInvitation } from '../../../services/training-event-invitation.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';

@Component({
  selector: 'app-training-event-invitation-form',
  templateUrl: './training-event-invitation-form.component.html',
  styleUrls: ['./training-event-invitation-form.component.scss']
})
export class TrainingEventInvitationFormComponent implements OnInit, OnChanges {
  @Input() invitation: any;
  @Input() trainingEventId: number | undefined;
  @Input() trainingEvent: any; // Added to get programme_id for filtering beneficiaries
  @Input() mode: 'create' | 'edit' | 'reminder' = 'create'; // Added mode for different form behaviors
  @Output() closeModal = new EventEmitter();

  invitationForm!: FormGroup;
  isEditMode = false;
  isReminderMode = false;
  isLoading = false;
  beneficiaries: any[] = [];
  allBeneficiaries: any[] = []; // Store all beneficiaries before filtering
  existingInvitations: any[] = []; // Store existing invitations for filtering

  statusOptions: ITrainingEventInvitation['invitation_status'][] = [
    'invited',
    'confirmed',
    'declined',
    'attended',
    'cancelled'
  ];

  reminderTypes = [
    { value: 'email', label: 'Email Only' },
    { value: 'sms', label: 'SMS Only' },
    { value: 'both', label: 'Email & SMS' }
  ];

  reminderStatusFilter = [
    { value: 'invited', label: 'Invited (No Response)' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'all', label: 'All Invitees' }
  ];

  constructor(
    private fb: FormBuilder,
    private invitationService: TrainingEventInvitationService,
    private toast: ToastService,
    private notificationUtil: NotificationUtil
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.isReminderMode = this.mode === 'reminder';
    this.loadBeneficiaries();
    if (this.invitation) {
      this.isEditMode = true;
      this.populateForm(this.invitation);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mode']) {
      this.isReminderMode = this.mode === 'reminder';
      this.initForm(); // Reinitialize form when mode changes
    }
    if (changes['invitation'] && changes['invitation'].currentValue) {
      this.isEditMode = true;
      this.populateForm(changes['invitation'].currentValue);
    }
  }

  initForm() {
    if (this.isReminderMode) {
      // Reminder form structure
      this.invitationForm = this.fb.group({
        reminder_type: ['both', Validators.required],
        status_filter: [['invited'], Validators.required],
        smme_ids: [[], Validators.required],
        message: [''] // Optional custom reminder message
      });
    } else {
      // Regular invitation form structure
      this.invitationForm = this.fb.group({
        smme_ids: [[], Validators.required],
        invitation_status: ['invited', Validators.required],
        notes: ['']
      });
    }
  }

  loadBeneficiaries() {
    this.isLoading = true;
    
    // Get programme_id from training event
    const programmeId = this.trainingEvent?.programme_id;
    
    if (!programmeId) {
      console.error('No programme_id found in training event:', this.trainingEvent);
      this.notificationUtil.showError('Cannot load beneficiaries: Programme information missing');
      this.isLoading = false;
      return;
    }
    
    // Load programme beneficiaries and existing invitations in parallel
    Promise.all([
      this.invitationService.getProgrammeBeneficiaries(programmeId).toPromise(),
      this.trainingEventId ? this.invitationService.getEventInvitations(this.trainingEventId).toPromise() : Promise.resolve({ data: [] })
    ]).then(([beneficiariesResponse, invitationsResponse]) => {
      const allBeneficiaries = beneficiariesResponse?.data || [];
      const existingInvitations = invitationsResponse?.data || [];
      
      // Filter out already invited beneficiaries (only for create mode)
      if (!this.isEditMode && !this.isReminderMode) {
        const invitedSMMEIds = existingInvitations.map((inv: any) => inv.smme_id);
        this.beneficiaries = allBeneficiaries.filter((beneficiary: any) => 
          !invitedSMMEIds.includes(beneficiary.smme_id || beneficiary.id)
        );
        
        if (this.beneficiaries.length === 0 && allBeneficiaries.length > 0) {
          this.notificationUtil.showInfo('All programme beneficiaries have already been invited to this event');
        }
      } else {
        // For edit/reminder mode, show all beneficiaries
        this.beneficiaries = allBeneficiaries;
        console.log('Loaded all beneficiaries for edit/reminder mode:', this.beneficiaries.length);
      }
      
      this.isLoading = false;
    }).catch((err: any) => {
      console.error('Error loading beneficiaries or invitations:', err);
      this.notificationUtil.showError('Failed to load beneficiaries');
      this.isLoading = false;
    });
  }

  getSelectedBeneficiariesCount(): number {
    const selectedIds = this.invitationForm.get('smme_ids')?.value || [];
    return selectedIds.length;
  }

  populateForm(invitationData: any) {
    this.invitationForm.patchValue({
      smme_ids: [invitationData.smme_id], // Convert single ID to array for edit mode
      invitation_status: invitationData.invitation_status || 'invited',
      notes: invitationData.notes
    });
  }

  onSubmit() {
    if (this.invitationForm.valid && !this.isLoading) {
      this.isLoading = true;
      const formData = this.invitationForm.value;
      const selectedIds = formData.smme_ids || [];

      if (selectedIds.length === 0) {
        this.notificationUtil.showError('Please select at least one beneficiary');
        this.isLoading = false;
        return;
      }

      if (this.isReminderMode) {
        
        this.invitationService.sendBulkReminders(
          this.trainingEventId!,
          selectedIds,
          formData.reminder_type
        ).subscribe({
          next: (response: any) => {
            const count = selectedIds.length;
            this.notificationUtil.showSuccess(
              response.message || `Reminder sent to ${count} beneficiarie(s)`
            );
            this.isLoading = false;
            this.closeModal.emit();
          },
          error: (err: any) => {
            console.error('Error sending reminders:', err);
            this.notificationUtil.showError('Failed to send reminders');
            this.isLoading = false;
          }
        });
      } else if (this.isEditMode && this.invitation) {
        // Edit mode - update single invitation
        const updateData = {
          invitation_status: formData.invitation_status,
          notes: formData.notes
        };
        this.invitationService.updateInvitation(this.invitation.id, updateData).subscribe({
          next: (response: any) => {
            this.notificationUtil.showSuccess(response.message || 'Invitation updated successfully');
            this.isLoading = false;
            this.closeModal.emit();
          },
          error: (err: any) => {
            console.error('Error updating invitation:', err);
            this.notificationUtil.showError('Failed to update invitation');
            this.isLoading = false;
          }
        });
      } else {
        // Create mode - send invitations to selected beneficiaries
        // Prepare invitation data with training_event_id appended
        const invitationData = {
          training_event_id: this.trainingEventId!,
          smme_ids: selectedIds,
          invitation_status: formData.invitation_status,
          notes: formData.notes || ''
        };
        
        this.invitationService.inviteBeneficiary(invitationData).subscribe({
          next: (response: any) => {
            const count = selectedIds.length;
            this.notificationUtil.showSuccess(
              response.message || `${count} invitation(s) sent successfully`
            );
            this.isLoading = false;
            this.closeModal.emit();
          },
          error: (err: any) => {
            console.error('Error sending invitations:', err);
            this.notificationUtil.showError('Failed to send invitations');
            this.isLoading = false;
          }
        });
      }
    } else {
      this.notificationUtil.showWarning('Please fill in all required fields');
    }
  }

  cancel() {
    this.closeModal.emit();
  }
}
