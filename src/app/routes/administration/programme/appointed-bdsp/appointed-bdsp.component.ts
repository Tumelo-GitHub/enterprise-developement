import { Component, Input, OnInit, SimpleChanges, ViewChild, Output, EventEmitter } from '@angular/core';
import { IProgramme } from 'src/app/shared';
import { AppointedBdspFormComponent } from './appointed-bdsp-form/appointed-bdsp-form.component';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BdspAppointmentService } from '../../services/bdsp-appointment.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { DELETE_TITLE, CONFIRM_DELETE_MESSAGE } from 'src/app/shared/common/devwizarrd.constants';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';

@Component({
  selector: 'app-appointed-bdsp',
  templateUrl: './appointed-bdsp.component.html',
  styleUrls: ['./appointed-bdsp.component.scss']
})
export class AppointedBdspComponent implements OnInit {
  @Input() programme: IProgramme | undefined;
  @Output() showForm = new EventEmitter<any>();
  @Output() editForm = new EventEmitter<any>();
  
  displayedColumns: string[] = ['bdsp_name', 'appointment_date', 'contract_start_date', 'contract_end_date', 'service_request_start_date', 'service_request_end_date', 'description', 'documents', 'action'];
  columnsToDisplay: string[] = this.displayedColumns;
  records: any[] =[];
  dataSource!: MatTableDataSource<any>;
  isLoading = false;
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
    private toast: ToastService,
    private notificationUtil: NotificationUtil
  ) { }

  ngOnInit(): void {
    // Load data if programme is already available (from route resolver or parent)
    if (this.programme) {
      this.getAppointedBeneficiaries(this.programme);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    if (changes['programme'] && changes['programme'].currentValue) {
      this.getAppointedBeneficiaries(changes['programme'].currentValue);
    }
  }

  getAppointedBeneficiaries(programme: IProgramme) {
    if (programme && programme.id) {
      this.isLoading = true;
      this.service.getAppointedBSDP(programme.id).subscribe({
        next: response => {
          this.records = response.data || [];
          this.dataSource = new MatTableDataSource(this.records);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.isLoading = false;
        },
        error: err => {
          console.error('Error loading BDSPs:', err);
          this.notificationUtil.showError('Failed to load BDSPs');
          this.isLoading = false;
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

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  }

  isContractExpired(endDate: string): boolean {
    if (!endDate) return false;
    try {
      return new Date(endDate) < new Date();
    } catch {
      return false;
    }
  }

  openAddBdspForm() {
    this.showForm.emit({ programme_id: this.programme?.id });
  }

  editBdsp(bdsp: any) {
    // Pass the full BDSP data through router state
    this.editForm.emit({ bdsp, programme_id: this.programme?.id, appointmentData: bdsp });
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
