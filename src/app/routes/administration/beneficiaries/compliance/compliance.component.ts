import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ComplianceService } from '../../services/compliance.service';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';
import { ICompliance, IComplianceStatus, IComplianceType } from 'src/app/shared';
import { TableUtil } from 'src/app/shared/utils/tableUtil';
@Component({
  selector: 'app-compliance',
  templateUrl: './compliance.component.html',
  styleUrls: ['./compliance.component.scss']
})
export class ComplianceComponent implements OnInit {
  @Input() company_id: number = 0;
  @Output() showForm: EventEmitter<any> = new EventEmitter();
  @Output() editForm: EventEmitter<any> = new EventEmitter();
  
  displayedColumns: string[] = ['type_id', 'registration_num', 'issued_date', 'expiry_date', 'status', 'isVerified', 'verified_person', 'document', 'action'];
  columnsToDisplay: string[] = this.displayedColumns;
  dataSource!: MatTableDataSource<any>;
  statuses: IComplianceStatus[] = [];
  types: IComplianceType[] = [];
  compliances: ICompliance[] = [];
  isLoading = false;
  searchTerm = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  blob: Blob | undefined;

  constructor(
    private complianceService: ComplianceService,
    private notification: NotificationUtil
    ) { }

  ngOnInit(): void {
    this.complianceService.getStatus().subscribe(
      resp => this.statuses = resp.data
    );

    this.complianceService.getTypes().subscribe(
      resp => this.types = resp.data
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    this.getComplianceList(changes['company_id'].currentValue);
  }

  displayDocument(id: number, filename: string) {
    /*
     TODO: Refactor function to be reusable to other pages if possible
     make function flexible by not hardcoding type and filename
     */
    this.complianceService.displayDoc(id).subscribe(
      resp => {
        this.blob = new Blob([resp], {type: 'application/pdf'});

        var downloadURL = window.URL.createObjectURL(resp);
        var link = document.createElement('a');
        link.href = downloadURL;
        link.download = filename;
        link.click();
      }
    );
  }

  getComplianceList(id: number) {
    if (id !== 0) {
      this.isLoading = true;
      this.complianceService.getComplienceListByCompany(id).subscribe({
        next: (res) => {
          this.compliances = res.data || [];
          this.dataSource = new MatTableDataSource(this.compliances);
          this.connectPaginationAndSort();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading compliance records:', err);
          this.compliances = [];
          this.dataSource = new MatTableDataSource([] as any[]);
          this.connectPaginationAndSort();
          this.isLoading = false;
        }
      })
    }
  }

  private connectPaginationAndSort() {
    setTimeout(() => {
      if (this.dataSource && this.paginator && this.sort) {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    }, 100);
  }

  getStatusNameById(id: number) : string {
    for (let i = 0; i < this.statuses.length; i++) {
      if (this.statuses[i].id == id)
        return this.statuses[i].status_name;
    }

    return '';
  }

  getTypeNameById(id: number) : string | undefined {
    // for (let i = 0; i < this.types.length; i++) {
    //   if (this.types[i].id == id)
    //     return this.types[i].type_name;
    // }

    return this.types.find(x => x.id === id)?.type_name;

  }

  openComplianceForm(data: any = {}) {
    // Emit event to show form for new/edit compliance
    if (data && data.id) {
      this.editForm.emit({ compliance: data, company_id: this.company_id, types: this.types, statuses: this.statuses });
    } else {
      this.showForm.emit({ company_id: this.company_id, types: this.types, statuses: this.statuses });
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchTerm = filterValue;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteCompliance(compliance: ICompliance) {
    const index = this.compliances.indexOf(compliance);
    const confirmed = confirm('Are you sure you want to delete this compliance record?');
    
    if (confirmed) {
      this.complianceService.delete(compliance.id).subscribe({
        next: resp => {
          this.notification.showSuccess(resp.message || 'Compliance record deleted successfully');
          // Update local list instead of refetching
          this.removeComplianceFromList(compliance.id);
        },
        error: (err) => {
          this.notification.showError('Failed to delete compliance record');
          console.error(err);
        }
      });
    }
  }

  // Methods to update local data without refetching
  addComplianceToList(newCompliance: any): void {
    // Add new compliance to the beginning of the list
    this.compliances.unshift(newCompliance);
    this.dataSource.data = [...this.compliances];
    this.connectPaginationAndSort();
  }

  updateComplianceInList(updatedCompliance: any): void {
    // Find and update the existing compliance
    const index = this.compliances.findIndex(compliance => compliance.id === updatedCompliance.id);
    if (index !== -1) {
      this.compliances[index] = updatedCompliance;
      this.dataSource.data = [...this.compliances];
      this.connectPaginationAndSort();
    }
  }

  removeComplianceFromList(complianceId: number): void {
    // Remove compliance from the list
    this.compliances = this.compliances.filter(compliance => compliance.id !== complianceId);
    this.dataSource.data = [...this.compliances];
    this.connectPaginationAndSort();
  }

  // Export functions
  exportTable() {
    TableUtil.exportTableToExcel("ComplianceTable", "Compliance Records");
  }

  exportTableToPDF() {
    TableUtil.exportTableToPDF("ComplianceTable", "Compliance Records", "Company Compliance Records", "l");
  }

  // Date formatting and status helpers
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  isExpired(dateString: string): boolean {
    if (!dateString) return false;
    const expiryDate = new Date(dateString);
    const today = new Date();
    return expiryDate < today;
  }

  isExpiringSoon(dateString: string): boolean {
    if (!dateString) return false;
    const expiryDate = new Date(dateString);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
  }

  getStatusClass(statusId: number): string {
    const status = this.statuses.find(s => s.id === statusId);
    if (!status) return 'unknown';
    
    const statusName = status.status_name.toLowerCase();
    if (statusName.includes('active') || statusName.includes('approved') || statusName.includes('valid')) {
      return 'active';
    } else if (statusName.includes('pending') || statusName.includes('review')) {
      return 'pending';
    } else if (statusName.includes('expired') || statusName.includes('rejected') || statusName.includes('invalid')) {
      return 'inactive';
    }
    return 'unknown';
  }

}
