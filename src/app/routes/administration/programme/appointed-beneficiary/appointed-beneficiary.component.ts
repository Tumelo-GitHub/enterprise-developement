import { Component, Input, OnInit, SimpleChanges, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { IProgramme } from 'src/app/shared';
import { ProgrammeService } from '../../services/programme.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';

@Component({
  selector: 'app-appointed-beneficiary',
  templateUrl: './appointed-beneficiary.component.html',
  styleUrls: ['./appointed-beneficiary.component.scss']
})
export class AppointedBeneficiaryComponent implements OnInit {
  @Input() programme: IProgramme | undefined;
  @Output() showForm = new EventEmitter<any>();
  @Output() editForm = new EventEmitter<any>();
  
  displayedColumns: string[] = ['smme_name', 'status_name', 'appointment_date', 'documents', 'action'];
  columnsToDisplay: string[] = this.displayedColumns;
  dataSource!: MatTableDataSource<any>;
  records: any[] = [];
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public dialog: MatDialog,
    private service: ProgrammeService,
    private toast: ToastService,
    private notificationUtil: NotificationUtil,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Load data if programme is already available (from route resolver or parent)
    if (this.programme) {
      this.getAppointedBeneficiaries(this.programme);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Only reload if programme actually changes (not just reference)
    if (changes['programme'] && changes['programme'].currentValue && 
        changes['programme'].currentValue !== changes['programme'].previousValue) {
      const currentId = changes['programme'].currentValue?.id;
      const previousId = changes['programme'].previousValue?.id;
      
      // Only reload if the programme ID actually changed
      if (currentId !== previousId) {
        this.getAppointedBeneficiaries(changes['programme'].currentValue);
      }
    }
  }

  getAppointedBeneficiaries(programme: IProgramme) {
    if (programme && programme.id) {
      this.isLoading = true;
      this.service.getAppointedBeneficiaries(programme.id).subscribe({
        next: data => {
          this.records = data.data || [];
          this.dataSource = new MatTableDataSource(this.records);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.isLoading = false;
        },
        error: err => {
          console.error('Error loading beneficiaries:', err);
          this.notificationUtil.showError('Failed to load beneficiaries');
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

  getStatusClass(status: any): string {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'appointed':
      case '1':
        return 'active';
      case 'inactive':
      case 'terminated':
      case '0':
        return 'inactive';
      case 'pending':
        return 'pending';
      default:
        return 'unknown';
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

  openAddBeneficiaryForm() {
    this.showForm.emit({ programme_id: this.programme?.id });
  }

  editBeneficiary(beneficiary: any) {
    // Pass the full beneficiary data through router state
    this.editForm.emit({ beneficiary, programme_id: this.programme?.id, appointmentData: beneficiary });
  }

  viewBeneficiaryDetails(beneficiary: any) {
    // Navigate to the beneficiary details page in administration/beneficiaries using Angular Router
    this.router.navigate(['/administration/beneficiaries', beneficiary.smme_id]);
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
