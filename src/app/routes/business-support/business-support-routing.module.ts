import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrainingComponent } from './training/training.component';
import { CoachingComponent } from './coaching/coaching.component';
import { MentorshipComponent } from './mentorship/mentorship.component';

const routes: Routes = [
  { path: 'training', component: TrainingComponent },
  { path: 'coaching', component: CoachingComponent },
  { path: 'mentorship', component: MentorshipComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BusinessSupportRoutingModule { }
