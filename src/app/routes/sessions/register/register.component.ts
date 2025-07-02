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
          firstName: [null, Validators.required],
          lastName: [null, Validators.required],
          phoneNumber: [null, Validators.required],
        }),
        this.fb.group({
          email: [null, [Validators.required, Validators.email]],
          password: [null, [Validators.required, Validators.minLength(6)]],
          confirmPassword: [null, Validators.required],
        })
      ])
    });
  }

  get formArray(): any | null {
    return this.registerForm.get('formArray') as FormGroup;
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
      email: formArrayValues[1].email,
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