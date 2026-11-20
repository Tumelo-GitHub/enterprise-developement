import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrainingComponent } from './training/training.component';
import { CoachingComponent } from './coaching/coaching.component';
import { MentorshipComponent } from './mentorship/mentorship.component';
import { TrainingVenueComponent } from './training/training-venue/training-venue.component';
import { TrainingEventListComponent } from './training/training-event-list/training-event-list.component';
import { TrainingEventInvitationsWrapperComponent } from './training/training-event-invitations-wrapper/training-event-invitations-wrapper.component';
import { TrainingEventFormWrapperComponent } from './training/training-event-form-wrapper/training-event-form-wrapper.component';
import { TrainingRegisterWrapperComponent } from './training/training-register-wrapper/training-register-wrapper.component';

const routes: Routes = [
  { 
    path: 'training', 
    component: TrainingComponent,
    children: [
      { path: '', component: TrainingEventListComponent },
      { path: 'new', component: TrainingEventFormWrapperComponent },
      { path: 'register', component: TrainingRegisterWrapperComponent },
      { path: ':eventId/edit', component: TrainingEventFormWrapperComponent },
      { path: ':eventId/invitations', component: TrainingEventInvitationsWrapperComponent }
    ]
  },
  { path: 'training/venue', component: TrainingVenueComponent },
  { path: 'coaching', component: CoachingComponent },
  { path: 'mentorship', component: MentorshipComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BusinessSupportRoutingModule { }
