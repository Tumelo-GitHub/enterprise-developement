import { Component, OnInit, ViewChild } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {FormControl} from '@angular/forms';
import { CourseService } from '../services/course.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { CourseFormComponent } from './course-form/course-form.component';
import { ICourse } from 'src/app/shared';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.scss']
})
export class CourseComponent implements OnInit {
  displayedColumns: string[] = ['trainingInstitute', 'courseName', 'courseCode', 'duration', 'nqf_level', 'description', 'exam', 'targetAudience', 'action'];
  columnsToDisplay: string[] = this.displayedColumns;
  dataSource!: MatTableDataSource<any>;
  courseList: ICourse[] = [];

  columns = new FormControl('');
  columnList = [
    [
      'trainingInstitute',
      'Institute Name'
    ],
    [
      'courseName',
      'Course Name',
    ],
    [
      'courseCode',
      'Course Code',
    ],
    [
      'duration',
      'Duration',
    ],
    [
      'nqf_level',
      'NQF Level',
    ],
    [
      'description',
      'Description',
    ],
    [
      'exam',
      'Exam',
    ],
    [
      'targetAudience',
      'Target Audience',
    ],
    [
      'action',
      'Action',
    ]
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(public dialog: MatDialog, private courseService: CourseService, private toast: ToastService) { }

  ngOnInit(): void {
    this.getCourseList();
  }

  getCourseList() {
    this.courseService.getCourseList().subscribe({
      next: (res) => {
        this.courseList = res.data;
        this.updateTable();
      },
      error: (err) => {
        console.log(err)
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

  openDialog(data: any = {}) {
    const index = this.courseList.indexOf(data);

    const dialogRef = this.dialog.open(CourseFormComponent, {
      data,
      panelClass: 'form-dialog'
    });
    dialogRef.afterClosed().subscribe((result: ICourse) => {
      if (result) {
        console.log(result, index);
        if (index >= 0) {
          this.courseList[index] = result;
        } else {
          this.courseList.push(result);
        }
        this.updateTable();
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteCourse(id: number) {
    const index = this.courseList.findIndex(course => course.id === id);

    this.toast.openConfirmBox('danger', 'Delete', 'Are you sure you want to delete this course?').subscribe(
      resp => {
        if (resp.success) {
          this.courseService.delete(id).subscribe({
            next: resp => {
              this.toast.toastNotification('success', 'Course successfully deleted', '');
              this.courseList.splice(index, 1);
              this.updateTable();
            },
            error: console.log
          })
        }
      }
    )
  }

  private updateTable() {
    this.dataSource = new MatTableDataSource(this.courseList);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
