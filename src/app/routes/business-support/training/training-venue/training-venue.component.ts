import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastService } from 'src/app/shared/services/toast.service';
import { TrainingVenueService } from '../../services/training-venue.service';
import { TrainingVenueFormComponent } from './training-venue-form/training-venue-form.component';
import { ITrainingVenue } from 'src/app/shared';

@Component({
  selector: 'app-training-venue',
  templateUrl: './training-venue.component.html',
  styleUrls: ['./training-venue.component.scss']
})
export class TrainingVenueComponent implements OnInit {
  displayedColumns: string[] = ['venue_name', 'address', 'tel_number', 'email', 'action'];
  columnsToDisplay: string[] = this.displayedColumns;
  dataSource!: MatTableDataSource<any>;
  venueList: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(public dialog: MatDialog, private toast: ToastService, private trainingVenueService: TrainingVenueService) { }

  ngOnInit(): void {
    this.getTrainingVenueList();
  }

  getTrainingVenueList() {
    this.trainingVenueService.getTrainingVenueList().subscribe({
      next: (res) => {
        this.venueList = res.data;
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
    const index = this.venueList.indexOf(data);

    const dialogRef = this.dialog.open(TrainingVenueFormComponent, {
      data,
      panelClass: 'form-dialog'
    });
    dialogRef.afterClosed().subscribe((result: ITrainingVenue) => {
      if (result) {
        console.log(result, index);
        if (index >= 0) {
          this.venueList[index] = result;
        } else {
          this.venueList.push(result);
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

  deleteVenue(id: number) {
    const index = this.venueList.findIndex(venue => venue.id === id);

    this.toast.openConfirmBox('danger', 'Delete', 'Are you sure you want to delete this venue?').subscribe(
      resp => {
        if (resp.success) {
          this.trainingVenueService.delete(id).subscribe({
            next: resp => {
              this.toast.toastNotification('success', 'Venue successfully deleted', '');
              this.venueList.splice(index, 1);
              this.updateTable();
            },
            error: console.log
          })
        }
      }
    )
  }

  private updateTable() {
    this.dataSource = new MatTableDataSource(this.venueList);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
