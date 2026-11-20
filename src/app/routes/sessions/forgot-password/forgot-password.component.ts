import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/core';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  form: FormGroup;
  emailSent = false;
  isSubmitting = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService
  ) { 
    this.form = this.fb.group({
      email: [null, [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.toast.toastNotification('danger', 'Error', 'Please enter a valid email address.');
      return;
    }

    this.isSubmitting = true;
    this.emailSent = false;

    this.auth.forgotPassword(this.form.value.email).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: response => {
        this.isSubmitting = false;
        this.emailSent = true;
        this.toast.toastNotification('success', 'Success', response.message);
        this.form.reset();
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          this.emailSent = false;
        }, 3000);
      },
      error: error => {
        this.isSubmitting = false;
        const errorMessage = error.error?.message || 'An error occurred. Please try again.';
        this.toast.toastNotification('danger', 'Error', errorMessage);
      }
    });
  }
}
