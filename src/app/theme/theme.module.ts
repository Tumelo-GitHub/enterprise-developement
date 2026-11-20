import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './auth-layout/auth-layout.component';
import { LogoutWarningDialogComponent } from './admin-layout/logout-warning-dialog/logout-warning-dialog.component';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    AuthLayoutComponent,
    LogoutWarningDialogComponent
  ],
  imports: [SharedModule]
})
export class ThemeModule { }
