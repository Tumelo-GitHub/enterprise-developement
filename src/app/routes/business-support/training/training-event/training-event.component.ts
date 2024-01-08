import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastService } from 'src/app/shared/services/toast.service';
import { TrainingEventFormComponent } from './training-event-form/training-event-form.component';
import { TrainingEventService } from '../../services/training-event.service';
import { CONFIRM_DELETE_MESSAGE, DELETE_TITLE } from 'src/app/shared/common/devwizarrd.constants';

@Component({
  selector: 'app-training-event',
  templateUrl: './training-event.component.html',
  styleUrls: ['./training-event.component.scss']
})
export class TrainingEventComponent implements OnInit {
  @Output() onEventSelect: EventEmitter<any> = new EventEmitter();
  displayedColumns: string[] = ['programme_name', 'service_provider_name', 'course_name', 'address', 'event_date', 'time', 'status_name', 'action'];
  dataSource!: MatTableDataSource<any>;
  events: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  clickedRow: any;

  constructor(
    public dialog: MatDialog,
    private toast: ToastService,
    private trainingEventService: TrainingEventService
  ) { }

  ngOnInit(): void {
    this.getEvents();
  }

  getEvents() {
    this.trainingEventService.getTrainingEvents().subscribe({
      next: (resp) => {
        this.events = resp.data;
        console.log(resp);
        this.dataSource = new MatTableDataSource(this.events);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => {
        console.log(err)
      }
    });
  }


  openDialog(data: any = {}) {
    const index = this.events.indexOf(data);

    const dialogRef = this.dialog.open(TrainingEventFormComponent, {
      data,
      panelClass: 'form-dialog'
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (index >= 0) {
          this.events[index] = result;
        } else {
          this.events.push(result);
        }
        this.dataSource = new MatTableDataSource(this.events); 
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

  getClickedRow (row: any) {
    this.clickedRow = row;
    this.onEventSelect.emit(row);
  }

  deleteEmp(event: any) {
    const index = this.events.indexOf(event);
    this.toast.openConfirmBox('danger', DELETE_TITLE, CONFIRM_DELETE_MESSAGE).subscribe(
      resp => {
        if (resp.success) {
          this.trainingEventService.delete(event.id).subscribe({
            next: resp => {
              this.toast.toastNotification('success', resp.message, '');
              this.events.splice(index, 1);
              this.dataSource = new MatTableDataSource(this.events);
            },
            error: console.log
          })
        }
      }
    )
  }

}
