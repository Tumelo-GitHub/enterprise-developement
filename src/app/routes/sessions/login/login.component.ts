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
    email: ['tumelo@naswenda.co.za', Validators.required],
    password: ['123456', Validators.required]
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private toast: ToastService, private bnIdle: BnNgIdleService) { }

  ngOnInit(): void {
    this.bnIdle.startWatching(1000).subscribe((isTimedOut: boolean) => {
      if (isTimedOut) {
        this.auth.logout();
        this.bnIdle.stopTimer();
      }
    });
  }

  onSubmit(): void {
    if (this.login.valid) {
      this.auth.login(this.login.value).subscribe(
        (resp) => {
          this.router.navigateByUrl('/');
          this.toast.toastNotification('success', 'Welcome Back', resp.message);
        },
        err => {
          console.log(err)
        }
      )
    }
  }

}
