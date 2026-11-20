import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgrammeCourseService } from 'src/app/routes/administration/services/programme-course.service';

@Component({
  selector: 'app-programme-course-form-wrapper',
  templateUrl: './programme-course-form-wrapper.component.html',
  styleUrls: ['./programme-course-form-wrapper.component.scss']
})
export class ProgrammeCourseFormWrapperComponent implements OnInit {
  programmeId: number | null = null;
  courseId: number | null = null;
  course: any = null;
  isEditMode = false;
  programmeName = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.programmeId = +params['programmeId'];
      const id = params['courseId'];
      this.isEditMode = id && id !== 'new';
      
      // Get course data from router state
      const navigation = this.router.getCurrentNavigation();
      const courseData = navigation?.extras?.state?.['courseData'] || history.state?.courseData;
      
      if (this.isEditMode) {
        this.courseId = +id;
        if (courseData) {
          // Use the data passed from the list
          this.course = { ...courseData, programme_id: this.programmeId };
        } else {
          // Fallback if no data in state
          this.course = { id: this.courseId, programme_id: this.programmeId };
        }
      } else {
        this.course = null;
      }
    });
  }

  goBackToProgrammes(): void {
    this.router.navigate(['/administration/programme']);
  }

  goBackToCourses(): void {
    this.router.navigate(['/administration/programme', this.programmeId, 'courses']);
  }

  onFormSubmitted(courseData: any): void {
    this.goBackToCourses();
  }

  onFormCancelled(): void {
    this.goBackToCourses();
  }
}
