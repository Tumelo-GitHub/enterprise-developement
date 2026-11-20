import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatPaginator} from '@angular/material/paginator';
import { MatSort} from '@angular/material/sort';
import { MatTableDataSource} from '@angular/material/table';
import { FormControl} from '@angular/forms';
import { ToastService } from 'src/app/shared/services/toast.service';
import { CourseService } from '../services/course.service';
import { ICourse } from 'src/app/shared';
import { Subject, takeUntil } from 'rxjs';
import { TextUtil } from 'src/app/shared/utils/textUtil';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';

// Constants
const COURSE_COLUMNS = [
  { key: 'trainingInstitute', label: 'Institute Name' },
  { key: 'courseName', label: 'Course Name' },
  { key: 'courseCode', label: 'Course Code' },
  { key: 'duration', label: 'Duration' },
  { key: 'nqf_level', label: 'NQF Level' },
  { key: 'description', label: 'Description' },
  { key: 'exam', label: 'Exam' },
  { key: 'targetAudience', label: 'Target Audience' },
  { key: 'action', label: 'Action' }
];

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.scss']
})
export class CourseComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = COURSE_COLUMNS.map(col => col.key);
  columnsToDisplay: string[] = [...this.displayedColumns];
  dataSource!: MatTableDataSource<ICourse>;
  courseList: ICourse[] = [];

  // Form visibility and editing state
  showForm = false;
  isEditMode = false;
  editingCourse: ICourse | null = null;
  loading = false;

  columns = new FormControl('');
  columnList = COURSE_COLUMNS.map(col => [col.key, col.label]);

  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private courseService: CourseService, private toast: ToastService, private notificationUtil: NotificationUtil) { }

  ngOnInit(): void {
    this.getCourseList();
  }

  ngAfterViewInit(): void {
    // Ensure paginator and sort are connected after view init
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCourseList() {
    this.loading = true;
    this.courseService.getCourseList()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.courseList = res.data;
          this.updateTable();
          this.loading = false;
        },
        error: (err) => {
          this.notificationUtil.showError('Error loading courses');
          console.error('Error loading courses:', err);
          this.loading = false;
        }
      })
  }

  removeColumn() {
    if (this.columnsToDisplay.length) {
      this.columnsToDisplay.pop();
    }
  }

  selectedColumns(column: any) {
    this.columnsToDisplay = column.value;
  }

  toggleForm(course: ICourse | null = null) {
    this.isEditMode = !!course;
    this.editingCourse = course;
    this.showForm = true;
  }

  hideForm() {
    this.showForm = false;
    this.isEditMode = false;
    this.editingCourse = null;
    // Reconnect paginator after form is hidden
    setTimeout(() => {
      if (this.dataSource && this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  onSaveCourse(courseData: ICourse) {
    if (this.isEditMode && this.editingCourse) {
      this.updateCourse(courseData);
    } else {
      this.addCourse(courseData);
    }
  }

  private addCourse(courseData: ICourse) {
    this.courseService.add(courseData).subscribe({
      next: (res) => {
        this.notificationUtil.showSuccess('Course added successfully');
        if (res.data) {
          this.courseList.push(res.data);
          this.updateTable();
        }
        this.hideForm();
      },
      error: (err) => {
        this.notificationUtil.showError('Failed to add course');
        console.error('Error adding course:', err);
      }
    });
  }

  private updateCourse(courseData: ICourse) {
    this.courseService.update(this.editingCourse!.id, courseData).subscribe({
      next: (res) => {
        this.notificationUtil.showSuccess('Course updated successfully');
        const index = this.courseList.findIndex(c => c.id === this.editingCourse!.id);
        if (index >= 0 && res.data) {
          this.courseList[index] = res.data;
          this.updateTable();
        }
        this.hideForm();
      },
      error: (err) => {
        this.notificationUtil.showError('Failed to update course');
        console.error('Error updating course:', err);
      }
    });
  }

  onCancelForm() {
    this.hideForm();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyFilterFromEvent(event: Event): void {
    this.applyFilter(event);
  }

  deleteCourse(id: number) {
    const index = this.courseList.findIndex(course => course.id === id);
    const course = this.courseList[index];
    
    this.toast.openConfirmBox('danger', 'Delete', `Are you sure you want to delete ${course.course_name}?`).subscribe(
      resp => {
        if (resp.success) {
          this.courseService.delete(id).subscribe({
            next: resp => {
              this.notificationUtil.showSuccess('Course successfully deleted');
              this.courseList.splice(index, 1);
              this.updateTable();
            },
            error: err => {
              this.notificationUtil.showError('Error deleting course');
              console.error('Error deleting course:', err);
            }
          });
        }
      }
    );
  }

  private updateTable() {
    this.dataSource = new MatTableDataSource(this.courseList);
    // Use setTimeout to ensure ViewChild elements are properly initialized
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
    });
  }

  // Utility method for truncating text
  truncateText(text: string, maxLength: number): string {
    return TextUtil.truncateText(text, maxLength);
  }

}
