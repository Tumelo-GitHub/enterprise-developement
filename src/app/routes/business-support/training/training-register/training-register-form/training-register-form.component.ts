import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { ToastService } from 'src/app/shared/services/toast.service';
import { QUALIFICATIONS, GENDER } from 'src/app/shared/common/devwizarrd.constants';
import { TrainingEventService } from '../../../services/training-event.service';
import { TrainingEventRegisterService } from '../../../services/training-event-register.service';
import { TrainingEventInvitationService } from '../../../services/training-event-invitation.service';

@Component({
  selector: 'app-training-register-form',
  templateUrl: './training-register-form.component.html',
  styleUrls: ['./training-register-form.component.scss']
})
export class TrainingRegisterFormComponent implements OnInit {
  @Input() registerData: any;
  @Input() isEditMode: boolean = false;
  @Input() registerEventId: number | null = null;
  @Output() saved = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  beneficiaryList: { smme_id: number; smme_name: string }[] = [];
  qualifications = QUALIFICATIONS;
  genderOptions = GENDER;
  form = this.fb.group({
    event_id: [null as number | null, Validators.required],
    smme_id: [null as number | null, Validators.required],
    attendee: [null as string | null, Validators.required],
    email: [null as string | null, Validators.required],
    tel_number: ['' as string, Validators.required],
    age: [null as number | null, Validators.required],
    gender: [null as string | null, Validators.required],
    qualification: [null as string | null, Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private trainingEventService: TrainingEventService,
    private trainingRegisterService: TrainingEventRegisterService,
    private invitationService: TrainingEventInvitationService
  ) { }

  ngOnInit(): void {
    if (this.registerData) {
      this.form.patchValue(this.registerData);
      this.getInvitedSmme(this.registerData.event_id);
    } else if (this.registerEventId) {
      this.form.patchValue({ event_id: this.registerEventId });
      this.getInvitedSmme(this.registerEventId);
    }
  }

  onSubmit() : void {
    if (this.registerData?.id) {
      this.trainingRegisterService.update(this.registerData.id, this.form.value).subscribe({
        next: response => {
          this.toast.toastNotification('success', 'Success', response.message);
          this.saved.emit(response.data);
        },
        error: console.error
      });
    } else {
      this.trainingRegisterService.create(this.form.value).subscribe({
        next: response => {
          console.log(response);
          this.toast.toastNotification('success', 'Success', response.message);
          this.saved.emit(response.data);
        },
        error: console.error
      });
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  getInvitedSmme (id: number) {
    // Use the confirmed beneficiaries endpoint from invitation service
    this.invitationService.getConfirmedBeneficiaries(id).subscribe({
      next: (response: any) =>  {
        this.beneficiaryList = response.data.map((item: any) => ({
          smme_id: item.smme_id,
          smme_name: item.smme_name
        }));
      },
      error: console.error
    });
  }

}
