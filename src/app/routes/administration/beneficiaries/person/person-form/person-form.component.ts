import { Component, Inject, OnInit } from '@angular/core';
import { PersonService } from '../../../services/person.service';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastService } from 'src/app/shared/services/toast.service';
import { CourseFormComponent } from '../../../course/course-form/course-form.component';
import { BUDGET, PROVINCES, LOCATION_TYPE, RACE, HOME_OWNERSHIP, TRANSPORT_MODE, INCOME_TYPE } from 'src/app/shared/common/devwizarrd.constants';

@Component({
  selector: 'app-person-form',
  templateUrl: './person-form.component.html',
  styleUrls: ['./person-form.component.scss']
})
export class PersonFormComponent implements OnInit {
  provinces = PROVINCES;
  locationTypes = LOCATION_TYPE;
  race = RACE;
  homeOwnership = HOME_OWNERSHIP;
  transportMode = TRANSPORT_MODE;
  budget = BUDGET;
  incomeTypes = INCOME_TYPE;
  form = this.fb.group({
    name: [null, Validators.required],
    surname: [null, Validators.required],
    id_number: [null, Validators.required],
    gender: [null, Validators.required],
    race: [null],
    duration: [null, Validators.required],
    age: [0],
    occupation: [null, Validators.required],
    cell_number: [null],
    tell_number: [null],
    email: [null],
    address: this.fb.group({
      street_address_1: [null, Validators.required],
      street_address_2: [null],
      city: [null, Validators.required],
      province: [null, Validators.required],
      code: [null],
      country: ["South Africa", Validators.required],
      location_type: [null, Validators.required],
    }),
    income: [null],
    home_ownership: [null],
    trasport_mode: [null],
    budget: [null],
    programme_id: [null]
});
get address(): FormGroup { return this.form.get('address') as FormGroup; }

  constructor(private fb: FormBuilder, 
    private personService: PersonService, 
    private toast: ToastService,
    private dialogRef: MatDialogRef<CourseFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.form.patchValue(this.data);
  }

  onSubmit() {
    if (this.form.valid) {
        const request = this.data.id ? 
            this.personService.update(this.data.id, this.form.value) : 
            this.personService.add(this.form.value);

        request.subscribe({
            next: (val) => {
                this.handleSuccess(val);
            },
            error: (err: any) => {
                this.handleError(err);
            }
        });
    }
  }

  handleSuccess(val: any) {
      this.toast.toastNotification('success', 'Success', val.message);
      this.dialogRef.close(val.data);
  }

  handleError(err: any) {
      this.toast.toastNotification('danger', 'Failed', err.message);
      console.error(err);
  }

  calculateAge() {
    const idNumber = this.form.get('id_number')?.value;
    // if (idNumber) {
    //   const year = idNumber.substring(0, 2);
    //   const currentYear = new Date().getFullYear().toString().substring(2, 4);
    //   const age = Number(currentYear) - Number(year);
    //   this.form.patchValue
    // }
  }
}
