import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ILoginRequest } from 'src/app/shared/interfaces';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private auth: AuthService,
        private router: Router,
        private toast: ToastService
    ) {
        this.loginForm = this.fb.group({
            email: [null, [Validators.required, Validators.email]],
            password: [null, [Validators.required, Validators.minLength(6)]]
        });
    }

    ngOnInit(): void {
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            this.toast.toastNotification('danger', 'Error', 'Please fill in all required fields correctly.');
            return;
        }

        const loginData: ILoginRequest = this.loginForm.value as ILoginRequest;

        this.auth.login(loginData).subscribe(
            (resp) => {
                this.router.navigateByUrl('/');
                this.toast.toastNotification('success', 'Welcome Back', resp.message);
            },
            (err) => {
                console.error('Login error:', err);
                const errorMessage = err || 'An error occurred during login. Please try again.';
                this.toast.toastNotification('danger', 'Error', errorMessage);
            }
        );
    }
}