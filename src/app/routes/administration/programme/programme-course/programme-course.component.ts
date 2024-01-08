import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IProgramme } from 'src/app/shared';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ProgrammeCourseFormComponent } from './programme-course-form/programme-course-form.component';
import { ProgrammeCourseService } from '../../services/programme-course.service';

@Component({
  selector: 'app-programme-course',
  templateUrl: './programme-course.component.html',
  styleUrls: ['./programme-course.component.scss']
})
export class ProgrammeCourseComponent implements OnInit {
  @Input() programme: IProgramme | undefined;
  displayedColumns: string[] = ['course_name', 'status_name', 'budget', 'action'];
  columnsToDisplay: string[] = this.displayedColumns;
  dataSource!: MatTableDataSource<any>;
  records: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public dialog: MatDialog,
    private programmeCourseService: ProgrammeCourseService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    this.getProgrammeCourses(changes['programme'].currentValue);
  }

  getProgrammeCourses(programme: IProgramme) : void {
    this.programmeCourseService.getProgrammeCourse(programme.id).subscribe({
      next: response => {
        this.records = response.data;
        this.dataSource = new MatTableDataSource(this.records);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      }
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openDialog(data: any = {}) {
    let index = this.records.indexOf(data);
    data['programme_id'] = this.programme?.id;
    const dialogRef = this.dialog.open(ProgrammeCourseFormComponent, {
      data,
      panelClass: 'form-dialog'
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (index >= 0) {
          this.records[index] = result;
        } else {
          this.records.push(result);
        }
        this.dataSource = new MatTableDataSource(this.records); 
      }
    });
  }

  deleteRecord(row: any) {
    const index = this.records.indexOf(row);
    this.toast.openConfirmBox('danger', 'Delete', 'Are you sure you want to delete this?').subscribe(
      resp => {
        if (resp.success) {
          this.programmeCourseService.delete(row.id).subscribe({
            next: resp => {
              this.toast.toastNotification('success', resp.message, '');
              this.records.splice(index, 1);
              this.dataSource = new MatTableDataSource(this.records);
            },
            error: console.log
          })
        }
      }
    );
  }

}
