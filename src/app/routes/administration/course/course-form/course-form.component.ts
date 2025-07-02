import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { INSTITUDES } from 'src/app/shared/common/devwizarrd.constants';
import { ToastService } from 'src/app/shared/services/toast.service';
import { CourseService } from '../../services/course.service';
import { ICourse } from 'src/app/shared';

@Component({
  selector: 'app-course-form',
  templateUrl: './course-form.component.html',
  styleUrls: ['./course-form.component.scss']
})
export class CourseFormComponent implements OnInit {
  institudes = INSTITUDES;
  form = this.fb.group({
    training_institute_id: [0, Validators.required],
    course_code: [null, Validators.required],
    course_name: [null, Validators.required],
    credits: [null, Validators.required],
    description: [null],
    duration: [null, Validators.required],
    exam: [null],
    nqf_level: [null, Validators.required],
    target_audiance: [null]
});

  constructor(private fb: FormBuilder, 
    private courseService: CourseService, 
    private toast: ToastService,
    private dialogRef: MatDialogRef<CourseFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.form.patchValue(this.data);
    this.form.patchValue({training_institute_id: Number(this.data.training_institute_id)});
    console.log(this.data);
  }

  onSubmit() {
    if (this.form.valid) {
        const request = this.data.id ? 
            this.courseService.update(this.data.id, this.form.value) : 
            this.courseService.add(this.form.value);

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

}
