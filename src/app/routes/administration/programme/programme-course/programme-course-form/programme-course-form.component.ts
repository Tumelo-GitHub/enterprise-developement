import { Component, Inject, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ComplianceFormComponent } from '../../../beneficiaries/compliance/compliance-form/compliance-form.component';
import { programmeCourseStatus } from 'src/app/shared/common/devwizarrd.constants';
import { CourseService } from '../../../services/course.service';
import { ProgrammeCourseService } from '../../../services/programme-course.service';
import { ICourse } from 'src/app/shared';

@Component({
  selector: 'app-programme-course-form',
  templateUrl: './programme-course-form.component.html',
  styleUrls: ['./programme-course-form.component.scss']
})
export class ProgrammeCourseFormComponent implements OnInit {
  courseList: ICourse[] = [];
  form = this.fb.group({
    programme_id: [this.data.programme_id, Validators.required],
    course_id: ['', Validators.required],
    status: ['', Validators.required],
    budget: ['', Validators.required]
  });
  statusOptions = programmeCourseStatus;

  constructor(
    private fb: FormBuilder, 
    public dialog: MatDialog,
    private toast: ToastService,
    private programmeCourseService: ProgrammeCourseService,
    private courseService: CourseService,
    private dialogRef: MatDialogRef<ComplianceFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.getCourseList();
    this.form.patchValue(data);
  }

  ngOnInit(): void {
  }

  getCourseList() : void {
    this.courseService.getCourseList().subscribe({
      next: response => {
        this.courseList = response.data;
      },
      error: console.log
    });
  }

  onSubmit() : void {
    if(this.data.id) {
      this.programmeCourseService.update(this.data.id, this.form.value).subscribe({
        next: response => {
          this.toast.toastNotification('success', response.message, '');
          this.dialogRef.close(response.data)
        },
        error: console.log
      });
    } else {
      this.programmeCourseService.add(this.form.value).subscribe({
        next: response => {
          this.toast.toastNotification('success', response.message, '');
          this.dialogRef.close(response.data)
        },
        error: console.log
      });
    }
  }

}
