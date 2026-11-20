import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared';

import { BusinessSupportRoutingModule } from './business-support-routing.module';
import { TrainingComponent } from './training/training.component';
import { CoachingComponent } from './coaching/coaching.component';
import { MentorshipComponent } from './mentorship/mentorship.component';
import { TrainingEventComponent } from './training/training-event/training-event.component';
import { TrainingEventFormComponent } from './training/training-event/training-event-form/training-event-form.component';
import { TrainingRegisterComponent } from './training/training-register/training-register.component';
import { TrainingShortcomingsComponent } from './training/training-shortcomings/training-shortcomings.component';
import { TrainingRegisterFormComponent } from './training/training-register/training-register-form/training-register-form.component';
import { TrainingVenueComponent } from './training/training-venue/training-venue.component';
import { TrainingVenueFormComponent } from './training/training-venue/training-venue-form/training-venue-form.component';
import { BeneficiariesListDialogComponent } from './training/training-event/beneficiaries-list-dialog/beneficiaries-list-dialog.component';
import { TrainingEventListComponent } from './training/training-event-list/training-event-list.component';
import { TrainingEventInvitationsComponent } from './training/training-event/training-event-invitations/training-event-invitations.component';
import { TrainingEventInvitationFormComponent } from './training/training-event/training-event-invitation-form/training-event-invitation-form.component';
import { TrainingEventInvitationsWrapperComponent } from './training/training-event-invitations-wrapper/training-event-invitations-wrapper.component';
import { TrainingEventFormWrapperComponent } from './training/training-event-form-wrapper/training-event-form-wrapper.component';
import { TrainingRegisterWrapperComponent } from './training/training-register-wrapper/training-register-wrapper.component';


@NgModule({
  declarations: [
    TrainingComponent,
    CoachingComponent,
    MentorshipComponent,
    TrainingEventComponent,
    TrainingEventFormComponent,
    TrainingRegisterComponent,
    TrainingShortcomingsComponent,
    TrainingRegisterFormComponent,
    TrainingVenueComponent,
    TrainingVenueFormComponent,
    BeneficiariesListDialogComponent,
    TrainingEventListComponent,
    TrainingEventInvitationsComponent,
    TrainingEventInvitationFormComponent,
    TrainingEventInvitationsWrapperComponent,
    TrainingEventFormWrapperComponent,
    TrainingRegisterWrapperComponent
  ],
  imports: [
    SharedModule,
    BusinessSupportRoutingModule
  ]
})
export class BusinessSupportModule { }
