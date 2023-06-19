import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';

import { ThemeModule } from './theme/theme.module';
import { SharedModule } from './shared';
import { RoutesModule } from './routes/routes.module';

import { BnNgIdleService } from 'bn-ng-idle'; 

import { httpInterceptorProviders } from './core';

// TOAST AND CONFIRMATION
import {
  ConfirmBoxConfigModule,
  DialogConfigModule,
  NgxAwesomePopupModule,
  ToastNotificationConfigModule,
} from '@costlydeveloper/ngx-awesome-popup';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SharedModule,
    ThemeModule,
    RoutesModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgxAwesomePopupModule.forRoot(),
    ToastNotificationConfigModule.forRoot(),
    DialogConfigModule.forRoot(), // optional
    ConfirmBoxConfigModule.forRoot()
  ],
  providers: [
    BnNgIdleService,
    httpInterceptorProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
