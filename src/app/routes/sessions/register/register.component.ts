import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core';
import { IRegisterRequest } from 'src/app/shared';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.registerForm = this.fb.group({
      formArray: this.fb.array([
        this.fb.group({
          firstName: [null, [Validators.required, Validators.minLength(2)]],
          lastName: [null, [Validators.required, Validators.minLength(2)]],
          email: [null, [Validators.required, Validators.email]],
          phoneNumber: [null, [Validators.required, Validators.pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)]]
          // company: [null]
        }),
        this.fb.group({
          password: [null, [Validators.required, Validators.minLength(8)]],
          confirmPassword: [null, Validators.required],
          agreeToTerms: [false, Validators.requiredTrue]
        }, { validators: this.passwordMatchValidator })
      ])
    });
  }

  private passwordMatchValidator(group: AbstractControl): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  get formArray(): any | null {
    return this.registerForm.get('formArray') as FormGroup;
  }

  getPasswordStrength(): string {
    const password = this.formArray?.get([1])?.get('password')?.value;
    if (!password) return '';
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 3) return 'medium';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    if (strength === 'weak') return 'Weak';
    if (strength === 'medium') return 'Medium';
    if (strength === 'strong') return 'Strong';
    return '';
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.toast.toastNotification('danger', 'Error', 'Please fill in all required fields correctly.');
      return;
    }

    const formArrayValues = this.registerForm.value.formArray;
    const data : IRegisterRequest = {
      first_name: formArrayValues[0].firstName,
      last_name: formArrayValues[0].lastName,
      phone_number: formArrayValues[0].phoneNumber,
      email: formArrayValues[0].email,
      password: formArrayValues[1].password
    };

    this.authService.register(data).subscribe({
      next: response => {
        this.router.navigateByUrl('/auth/login');
        this.toast.toastNotification('success', 'Sign Up', response.message);
      },
      error: error => {
        console.error('Registration error:', error);
        const errorMessage = error.error?.message || 'An error occurred during registration. Please try again.';
        this.toast.toastNotification('danger', 'Error', errorMessage);
      }
    });
  }
}