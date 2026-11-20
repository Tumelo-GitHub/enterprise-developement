import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { INSTITUDES } from 'src/app/shared/common/devwizarrd.constants';
import { CourseService } from '../../services/course.service';
import { ICourse } from 'src/app/shared';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';

@Component({
  selector: 'app-course-form',
  templateUrl: './course-form.component.html',
  styleUrls: ['./course-form.component.scss']
})
export class CourseFormComponent implements OnInit {
  @Input() courseData: ICourse | null = null;
  @Input() isEditMode = false;
  @Output() save = new EventEmitter<ICourse>();
  @Output() cancel = new EventEmitter<void>();

  institudes = INSTITUDES;
  form = this.fb.group({
    training_institute_id: [0, Validators.required],
    course_code: ['', Validators.required],
    course_name: ['', Validators.required],
    credits: ['', Validators.required],
    description: [''],
    duration: ['', Validators.required],
    exam: [''],
    nqf_level: ['', Validators.required],
    target_audiance: ['']
});

  constructor(private fb: FormBuilder, 
    private courseService: CourseService, 
    private notificationUtil: NotificationUtil) { }

  ngOnInit(): void {
    if (this.courseData) {
      // Map only the form fields with proper type conversion
      this.form.patchValue({
        training_institute_id: Number(this.courseData.training_institute_id),
        course_code: this.courseData.course_code,
        course_name: this.courseData.course_name,
        credits: this.courseData.credits,
        description: this.courseData.description,
        duration: this.courseData.duration,
        exam: this.courseData.exam,
        nqf_level: this.courseData.nqf_level,
        target_audiance: this.courseData.target_audiance
      });
      console.log(this.courseData);
    }
  }

  onSubmit() {
    if (this.form.valid) {
        const request = this.courseData?.id ? 
            this.courseService.update(this.courseData.id, this.form.value) : 
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
      this.notificationUtil.showSuccess(val.message || 'Course saved successfully');
      this.save.emit(val.data);
  }

  onCancel() {
      this.cancel.emit();
  }

  handleError(err: any) {
      this.notificationUtil.showError(err.message || 'Failed to save course');
      console.error(err);
  }

}
