import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { RoutesRoutingModule } from './routes-routing.module';

import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './sessions/login/login.component';
import { RegisterComponent } from './sessions/register/register.component';

@NgModule({
  declarations: [
    DashboardComponent,
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    SharedModule,
    RoutesRoutingModule,
  ]
})
export class RoutesModule { }
