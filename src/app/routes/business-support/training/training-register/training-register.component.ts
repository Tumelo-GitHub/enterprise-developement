import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastService } from 'src/app/shared/services/toast.service';
import { TrainingRegisterFormComponent } from './training-register-form/training-register-form.component';
import { TrainingEventRegisterService } from '../../services/training-event-register.service';
import { CONFIRM_DELETE_MESSAGE, DELETE_TITLE } from 'src/app/shared/common/devwizarrd.constants';
import { TableUtil } from 'src/app/shared/utils/tableUtil';

@Component({
  selector: 'app-training-register',
  templateUrl: './training-register.component.html',
  styleUrls: ['./training-register.component.scss']
})
export class TrainingRegisterComponent implements OnInit {
  @Input() event_id: number = 0;
  displayedColumns: string[] = ['smme_name', 'attendee', 'email', 'tel_number', 'action'];
  dataSource!: MatTableDataSource<any>;
  register: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public dialog: MatDialog,
    private toast: ToastService,
    private trainingRegisterService: TrainingEventRegisterService
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    this.getEventRegister(changes['event_id'].currentValue);
  }

  getEventRegister(id: number) {
    if (id > 0) {
      this.trainingRegisterService.getTrainingRegister(id).subscribe({
        next: response => {
          this.register = response.data;
          this.dataSource = new MatTableDataSource(this.register);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        },
        error: console.error
      });
    }
  }

  openDialog(data: any = {}) {
    const index = this.register.indexOf(data);
    data.event_id = this.event_id;

    const dialogRef = this.dialog.open(TrainingRegisterFormComponent, {
      data,
      panelClass: 'form-dialog'
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (index >= 0) {
          this.register[index] = result;
        } else {
          this.register.push(result);
        }
        this.dataSource = new MatTableDataSource(this.register); 
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

  exportTableToPDF() {
    TableUtil.exportTableToPDF("TrainingEventRegisterTable", "Training Event Register", "Training Event Register", "l");
  }

  deleteRecord (row: any) {
    const index = this.register.indexOf(row);
    this.toast.openConfirmBox('danger', DELETE_TITLE, CONFIRM_DELETE_MESSAGE).subscribe(
      resp => {
        if (resp.success) {
          this.trainingRegisterService.delete(row.id).subscribe({
            next: resp => {
              this.toast.toastNotification('success', resp.message, '');
              this.register.splice(index, 1);
              this.dataSource = new MatTableDataSource(this.register);
            },
            error: console.log
          })
        }
      }
    )
  }

}
