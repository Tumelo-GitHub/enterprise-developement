import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './auth-layout/auth-layout.component';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    AuthLayoutComponent
  ],
  imports: [SharedModule]
})
export class ThemeModule { }
