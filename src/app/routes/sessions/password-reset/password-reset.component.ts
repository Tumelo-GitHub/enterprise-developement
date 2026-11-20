import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/core';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit, OnDestroy {
  form: FormGroup;
  isSubmitting = false;
  isLoading = true;
  resetSuccess = false;
  token: string | null = null;
  hidePassword = true;
  hideConfirmPassword = true;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator.bind(this)
    });
  }

  ngOnInit(): void {
    // Extract token from URL query params
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.token = params['token'];
      this.isLoading = false;

      if (!this.token) {
        this.toast.toastNotification('danger', 'Error', 'Invalid reset link. Please request a new password reset.');
        setTimeout(() => {
          this.router.navigate(['/auth/forgot-password']);
        }, 2000);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Custom validator to check if passwords match
  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (confirmPassword.errors && !confirmPassword.errors['passwordMismatch']) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ 'passwordMismatch': true });
      return { 'passwordMismatch': true };
    } else {
      confirmPassword.setErrors(null);
      return null;
    }
  }

  onSubmit(): void {
    if (this.form.invalid || !this.token) {
      this.toast.toastNotification('danger', 'Error', 'Please fill in all fields correctly.');
      return;
    }

    // Check if passwords match
    const password = this.form.get('password')?.value;
    const confirmPassword = this.form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      this.toast.toastNotification('danger', 'Error', 'Passwords do not match.');
      return;
    }

    this.isSubmitting = true;

    this.auth.resetPassword(this.token, password).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        this.resetSuccess = true;
        this.toast.toastNotification('success', 'Success', response.message || 'Password reset successfully!');

        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error: any) => {
        this.isSubmitting = false;
        const errorMessage = error.error?.message || 'Failed to reset password. Please try again.';
        this.toast.toastNotification('danger', 'Error', errorMessage);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }
}
