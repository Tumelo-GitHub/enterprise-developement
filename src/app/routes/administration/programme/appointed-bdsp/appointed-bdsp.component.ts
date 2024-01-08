import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { IProgramme } from 'src/app/shared';
import { AppointedBdspFormComponent } from './appointed-bdsp-form/appointed-bdsp-form.component';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BdspAppointmentService } from '../../services/bdsp-appointment.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { DELETE_TITLE, CONFIRM_DELETE_MESSAGE } from 'src/app/shared/common/devwizarrd.constants';

@Component({
  selector: 'app-appointed-bdsp',
  templateUrl: './appointed-bdsp.component.html',
  styleUrls: ['./appointed-bdsp.component.scss']
})
export class AppointedBdspComponent implements OnInit {
  @Input() programme: IProgramme | undefined;
  displayedColumns: string[] = ['bdsp_name', 'appointment_date', 'contract_start_date', 'contract_end_date', 'service_request_start_date', 'service_request_end_date', 'description', 'documents', 'action'];
  columnsToDisplay: string[] = this.displayedColumns;
  records: any[] =[];
  dataSource!: MatTableDataSource<any>;
  columnsList = [
    [
      'bdsp_name',
      'BDSP'
    ],
    [
      'appointment_date',
      'Appointed Date'
    ],
    [
      'contract_start_date',
      'Contract Start Date'
    ],
    [
      'contract_end_date',
      'Contract End Date'
    ],
    [
      'service_request_start_date',
      'Service Request Start Date'
    ],
    [
      'service_request_end_date',
      'Service Request End Date'
    ],
    [
      'description',
      'Description'
    ],
    [
      'documents',
      'Documents'
    ],
    [
      'action',
      'Action'
    ]
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public dialog: MatDialog,
    private service: BdspAppointmentService,
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
      this.service.getAppointedBSDP(programme.id).subscribe({
        next: response => {
          this.records = response.data;
          console.log(response)
          this.dataSource = new MatTableDataSource(this.records);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        },
        error: err => console.log(err)
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
    let index = this.records.indexOf(data);
    data['programme_id'] = this.programme?.id;

    const dialogRef = this.dialog.open(AppointedBdspFormComponent, {
      data: data,
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

  deleteAppointment(data: any) {
    const index = this.records.indexOf(data);
    this.toast.openConfirmBox('danger', DELETE_TITLE, CONFIRM_DELETE_MESSAGE).subscribe(
      resp => {
        if (resp.success) {
          this.service.delete(data.id).subscribe({
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
