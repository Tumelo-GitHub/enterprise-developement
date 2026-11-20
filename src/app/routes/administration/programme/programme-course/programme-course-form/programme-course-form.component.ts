import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';
import { programmeCourseStatus } from 'src/app/shared/common/devwizarrd.constants';
import { CourseService } from '../../../services/course.service';
import { ProgrammeCourseService } from '../../../services/programme-course.service';
import { ICourse } from 'src/app/shared';

@Component({
  selector: 'app-programme-course-form',
  templateUrl: './programme-course-form.component.html',
  styleUrls: ['./programme-course-form.component.scss']
})
export class ProgrammeCourseFormComponent implements OnInit, OnChanges {
  @Input() programmeCourse: any = null;
  @Input() isEditMode = false;
  @Input() programmeId: number | undefined;
  @Output() formSubmitted = new EventEmitter<any>();
  @Output() formCancelled = new EventEmitter<void>();

  courseList: ICourse[] = [];
  isLoading = false;
  statusOptions = programmeCourseStatus;

  form = this.fb.group({
    programme_id: ['', Validators.required],
    course_id: ['', Validators.required],
    status: ['', Validators.required],
    budget: ['', [Validators.required, Validators.min(1)]]
  });

  constructor(
    private fb: FormBuilder,
    private notificationUtil: NotificationUtil,
    private programmeCourseService: ProgrammeCourseService,
    private courseService: CourseService
  ) {
    this.getCourseList();
  }

  ngOnInit(): void {
    // Set programme_id from input
    if (this.programmeId) {
      this.form.patchValue({ programme_id: this.programmeId.toString() });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['programmeCourse'] && this.programmeCourse) {
      this.populateForm();
    }
    if (changes['programmeId'] && this.programmeId) {
      this.form.patchValue({ programme_id: this.programmeId.toString() });
    }
  }

  populateForm(): void {
    if (this.programmeCourse) {
      this.form.patchValue({
        programme_id: this.programmeCourse.programme_id?.toString() || this.programmeId?.toString(),
        course_id: this.programmeCourse.course_id,
        status: this.programmeCourse.status,
        budget: this.programmeCourse.budget
      });
    }
  }

  getCourseList(): void {
    this.courseService.getCourseList().subscribe({
      next: response => {
        this.courseList = response.data;
      },
      error: error => {
        console.error('Error loading courses:', error);
        this.notificationUtil.showError('Failed to load course list');
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.markFormGroupTouched();
      this.notificationUtil.showError('Please fill in all required fields correctly');
      return;
    }

    this.isLoading = true;
    const formData = this.form.value;

    if (this.isEditMode && this.programmeCourse?.id) {
      // Update existing course
      this.programmeCourseService.update(this.programmeCourse.id, formData).subscribe({
        next: response => {
          this.isLoading = false;
          this.notificationUtil.showSuccess('Programme course updated successfully');
          this.formSubmitted.emit(response.data);
        },
        error: error => {
          this.isLoading = false;
          console.error('Error updating programme course:', error);
          this.notificationUtil.showError('Failed to update programme course');
        }
      });
    } else {
      // Add new course
      this.programmeCourseService.add(formData).subscribe({
        next: response => {
          this.isLoading = false;
          this.notificationUtil.showSuccess('Programme course added successfully');
          this.formSubmitted.emit(response.data);
        },
        error: error => {
          this.isLoading = false;
          console.error('Error adding programme course:', error);
          this.notificationUtil.showError('Failed to add programme course');
        }
      });
    }
  }

  cancelForm(): void {
    this.form.reset();
    this.isLoading = false;
    this.formCancelled.emit();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }
}
