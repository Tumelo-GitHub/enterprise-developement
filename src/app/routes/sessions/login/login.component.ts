import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core';
import { ToastService } from 'src/app/shared/services/toast.service';
import { BnNgIdleService } from 'bn-ng-idle';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    login = this.fb.group({
        email: [null, Validators.required],
        password: [null, Validators.required]
    });

    constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private toast: ToastService, private bnIdle: BnNgIdleService) { }

    ngOnInit(): void {
        // console.log('testing')
        // this.bnIdle.startWatching(60).subscribe((isTimedOut: boolean) => {
        //   console.log('session started');
        //   if (isTimedOut) {
        //     console.log('seesion Expired')
        //     this.auth.logout();
        //     this.bnIdle.stopTimer();
        //   }
        // });
    }

    onSubmit(): void {
        this.auth.login(this.login.value).subscribe(
            (resp) => {
                this.router.navigateByUrl('/');
                this.toast.toastNotification('success', 'Welcome Back', resp.message);
            },
            err => {
                console.log(err)
                this.toast.toastNotification('danger', 'Error', err.error.password);
            }
        )
    }

}
