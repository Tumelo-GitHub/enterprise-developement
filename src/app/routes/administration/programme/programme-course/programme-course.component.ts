import { Component, Input, OnInit, SimpleChanges, ViewChild, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IProgramme } from 'src/app/shared';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ProgrammeCourseService } from '../../services/programme-course.service';

@Component({
  selector: 'app-programme-course',
  templateUrl: './programme-course.component.html',
  styleUrls: ['./programme-course.component.scss']
})
export class ProgrammeCourseComponent implements OnInit, AfterViewInit {
  @Input() programme: IProgramme | undefined;
  @Output() showForm = new EventEmitter<any>();
  @Output() editForm = new EventEmitter<any>();

  displayedColumns: string[] = ['course_name', 'status_name', 'budget', 'action'];
  columnsToDisplay: string[] = this.displayedColumns;
  dataSource!: MatTableDataSource<any>;
  records: any[] = [];

  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private programmeCourseService: ProgrammeCourseService,
    private notificationUtil: NotificationUtil,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    // Load data if programme is already available (from route resolver or parent)
    if (this.programme) {
      this.getProgrammeCourses(this.programme);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['programme'] && changes['programme'].currentValue) {
      this.getProgrammeCourses(changes['programme'].currentValue);
    }
  }

  ngAfterViewInit() {
    // Initialize data source with paginator and sort after view init
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  getProgrammeCourses(programme: IProgramme): void {
    this.isLoading = true;
    this.programmeCourseService.getProgrammeCourse(programme.id).subscribe({
      next: response => {
        this.records = response.data || [];
        this.dataSource = new MatTableDataSource(this.records);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading programme courses:', error);
        this.notificationUtil.showError('Failed to load programme courses');
        this.isLoading = false;
      }
    });
  }

  refreshData() {
    if (this.programme) {
      this.getProgrammeCourses(this.programme);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyFilterFromEvent(event: Event) {
    this.applyFilter(event);
  }

  openAddCourseForm() {
    this.showForm.emit({ programme_id: this.programme?.id });
  }

  editCourse(course: any) {
    // Pass the full course data through router state
    this.editForm.emit({ course, programme_id: this.programme?.id, courseData: course });
  }

  getStatusClass(status: any): string {
    switch (status?.toLowerCase()) {
      case 'active':
      case '1':
        return 'active';
      case 'inactive':
      case '0':
        return 'inactive';
      case 'pending':
        return 'pending';
      default:
        return 'unknown';
    }
  }

  deleteRecord(row: any) {
    this.toast.openConfirmBox('danger', 'Delete Course', 'Are you sure you want to delete this course from the programme?').subscribe(
      (resp: any) => {
        if (resp.success) {
          this.programmeCourseService.delete(row.id).subscribe({
            next: resp => {
              const index = this.records.indexOf(row);
              this.records.splice(index, 1);
              this.dataSource.data = [...this.records];
              this.notificationUtil.showSuccess('Course deleted successfully!');
            },
            error: (error) => {
              console.error('Error deleting course:', error);
              this.notificationUtil.showError('Failed to delete course');
            }
          });
        }
      }
    );
  }
}
