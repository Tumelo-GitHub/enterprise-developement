import { Component, Inject, OnInit } from '@angular/core';
import { TimesheetComponent } from '../timesheet.component';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastService } from 'src/app/shared/services/toast.service';
import { TimesheetService } from '../../services/timesheet.service';
import * as moment from 'moment';
import { ITimesheet } from 'src/app/shared';

@Component({
  selector: 'app-timesheet-form',
  templateUrl: './timesheet-form.component.html',
  styleUrls: ['./timesheet-form.component.scss']
})
export class TimesheetFormComponent implements OnInit {
  form!: FormGroup;
  projects: any[] = [];
  companies: any[] = [];
  isEditMode: boolean = false;
  activities: any[] = [
    'Credit Collection Group',
    'GPG - Group',
    'Intro Session',
    'Meeting - General Project',
    'Meeting - Minutes',
    'Meeting - Credit',
    'Meeting - Assessment',
    'Meeting - Naswenda',
    'Meeting - SBSA Status',
    'Payments',
    'phone call',
    'Recruitment',
    'Reporting',
  ];
  workTypes: any[] = [
    'Access to market',
    'Access to finance',
    'Business development',
    'Project management',
    'Special projects',
    'Business Assessment',
  ];
  companySelected: number = 0;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private _toast: ToastService,
    private _timesheetService: TimesheetService,
    private dialogRef: MatDialogRef<TimesheetComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    this.form = this.fb.group({
      date: [null, Validators.required],
      timesheets: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.form.patchValue(this.data);
    this.isEditMode = this.data?.id ? true : false;
    if (this.isEditMode) {
      this.addTimesheet(this.data);
    } else {
      this.addTimesheet();
    }
    this.getProjects();
    this.projectChange({value: this.data.project_id ?? '1'});
  }

  get timesheets(): FormArray {
    return this.form.get('timesheets') as FormArray;
  }

  addTimesheet(timesheet?: ITimesheet): void {
    const timesheetGroup = this.fb.group({
      project_id: [timesheet ? timesheet.project_id : null, Validators.required],
      company_id: [timesheet ? timesheet.company_id : null, Validators.required],
      general_activity: [timesheet ? timesheet.general_activity : null],
      work_type: [timesheet ? timesheet.work_type : null, Validators.required],
      duration: [timesheet ? timesheet.duration : "00:00:00", Validators.required],
      comment: [timesheet ? timesheet.comment : null]
    });
    this.timesheets.push(timesheetGroup);
  }

  removeTimesheet(index: number): void {
    this.timesheets.removeAt(index);
  }

  getProjects() {
    this._timesheetService.getProjects().subscribe({
      next: resp => {
        this.projects = resp.data;
      },
      error: console.log
    });
  }

  projectChange(event: any) {
    this._timesheetService.getCompanies(event.value).subscribe({
      next: resp => {
        this.companies = resp.data;
      },
      error: console.log
    });
  }

  companyChange(event: any) {
    this.companySelected = event.value;
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = { ...this.form.value };

      // Convert dates to string YYYY-MM-DD
      formValue.date = moment(formValue.date).format('YYYY-MM-DD');
      // Set the date for each timesheet
      formValue.timesheets.forEach((timesheet: ITimesheet) => {
        timesheet.date = formValue.date;
      });

      const request = this.data?.id ?
        this._timesheetService.update(this.data.id, formValue.timesheets[0]) :
        this._timesheetService.create(formValue.timesheets);

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
    this._toast.toastNotification('success', 'Success', val.message);
    this.dialogRef.close(val.data);
  }

  handleError(err: any) {
    this._toast.toastNotification('danger', 'Failed', err.message);
    console.error(err);
  }
}
