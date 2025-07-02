import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastService } from 'src/app/shared/services/toast.service';
import { TrainingEventFormComponent } from './training-event-form/training-event-form.component';
import { TrainingEventService } from '../../services/training-event.service';
import { CONFIRM_DELETE_MESSAGE, DELETE_TITLE } from 'src/app/shared/common/devwizarrd.constants';
import { TableUtil } from 'src/app/shared/utils/tableUtil';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-training-event',
  templateUrl: './training-event.component.html',
  styleUrls: ['./training-event.component.scss']
})
export class TrainingEventComponent implements OnInit {
  @Output() onEventSelect: EventEmitter<number[]> = new EventEmitter();
  displayedColumns: string[] = ['select', 'programme_name', 'service_provider_name', 'course_name', 'address', 'event_date', 'time', 'status_name', 'action'];
  dataSource = new MatTableDataSource<any>([]);;
  events: any[] = [];
  selection = new SelectionModel<any>(true, []);

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
        this.updateTable();
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
        this.updateTable();
      }
    });
  }

  // TODO: Implement the exportTable and exportTableToPDF as separate component
  exportTable() {
    TableUtil.exportTableToExcel("TrainingEventTable", "Training Events");
  }

  exportTableToPDF() {
    // TableUtil.exportTableToPDF("TrainingEventTable", "Training Events", "Training Events", "l");
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadRegister () : void {
    var arrayOfIds = this.selection.selected.map(x => x.id);
    // check if the array is empty
    if (arrayOfIds.length === 0) {
      this.toast.toastNotification('info', 'Info', 'No record selected');
      return
    }
    this.onEventSelect.emit(arrayOfIds);
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
              this.updateTable();
            },
            error: console.log
          })
        }
      }
    )
  }

  private updateTable() {
    this.dataSource = new MatTableDataSource(this.events);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
}
