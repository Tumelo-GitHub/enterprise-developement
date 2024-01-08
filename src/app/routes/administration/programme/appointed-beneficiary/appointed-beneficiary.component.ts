import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { AppointedBeneficiaryFormComponent } from './appointed-beneficiary-form/appointed-beneficiary-form.component';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IProgramme } from 'src/app/shared';
import { ProgrammeService } from '../../services/programme.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-appointed-beneficiary',
  templateUrl: './appointed-beneficiary.component.html',
  styleUrls: ['./appointed-beneficiary.component.scss']
})
export class AppointedBeneficiaryComponent implements OnInit {
  @Input() programme: IProgramme | undefined;
  displayedColumns: string[] = ['smme_name', 'status_name', 'appointment_date', 'documents', 'action'];
  columnsToDisplay: string[] = this.displayedColumns;
  dataSource!: MatTableDataSource<any>;
  records: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public dialog: MatDialog,
    private service: ProgrammeService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    this.getAppointedBeneficiaries(changes['programme'].currentValue);
  }

  getAppointedBeneficiaries(programme: IProgramme) {
    if (programme && programme.id) {
      this.service.getAppointedBeneficiaries(programme.id).subscribe({
        next: data => {
          this.records = data.data;
          this.dataSource = new MatTableDataSource(this.records);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        },
        error: err => {
          console.error(err);
        }
      })
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openDialog(data: any = {}) {
    var selectedIndex = this.records.indexOf(data);
    data['programme_id'] = this.programme?.id;

    const dialogRef = this.dialog.open(AppointedBeneficiaryFormComponent, {
      data: data,
      panelClass: 'form-dialog'
    });
    dialogRef.afterClosed().subscribe((result: any[]) => {
      if (result) {
        if (selectedIndex >= 0) {
          this.records[selectedIndex] = result[0];
        } else {
          result.forEach(element => {
            this.records.push(element);
          });
        }
        this.dataSource = new MatTableDataSource(this.records); 
      }
    });
  }

  deleteAppointment(data: any) {
    const index = this.records.indexOf(data);
    this.toast.openConfirmBox('danger', 'Delete', 'Are you sure you want to delete this?').subscribe(
      resp => {
        if (resp.success) {
          this.service.deleteAppointment(data.id).subscribe({
            next: response => {
              this.toast.toastNotification('success', response.message, '');
              // this.getComplianceList(this.company_id);
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
