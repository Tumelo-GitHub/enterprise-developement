import { Component, OnInit } from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  constructor(private _formBuilder: FormBuilder, private authService: AuthService, private router: Router) { }
  
  
  
  get formArray(): any | null { return this.registerForm.get('formArray') as FormGroup; }


  ngOnInit(): void {
    this.registerForm = this._formBuilder.group({
      // first group
      formArray: this._formBuilder.array([
        this._formBuilder.group({
          firstName: ['Tumelo', Validators.required],
          lastName: ['Mokgonyana', Validators.required],
          phoneNumber: ['0763157170', Validators.required],
        }),
        // second group
        this._formBuilder.group({
          email: ['tumelo@naswenda.co.za', Validators.email],
          password: ['123456', Validators.required],
          confirmPassword: ['123456', Validators.required],
        })
      ])
    })
  }

  onSubmit() {
    let formArray = this.registerForm.value.formArray
    let data = {
      'firstName': formArray[0].firstName,
      'lastName': formArray[0].lastName,
      'phoneNumber': formArray[0].phoneNumber,
      'email': formArray[1].email,
      'password': formArray[1].password
    }
    this.authService.register(data).subscribe(
      () => this.router.navigateByUrl('/'),
      err => console.error(err)
    )
  }

}
