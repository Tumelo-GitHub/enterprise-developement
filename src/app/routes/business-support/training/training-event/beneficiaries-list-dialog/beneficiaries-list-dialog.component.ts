import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { TableUtil } from 'src/app/shared/utils/tableUtil';
import { Router } from '@angular/router';

@Component({
  selector: 'app-beneficiaries-list-dialog',
  templateUrl: './beneficiaries-list-dialog.component.html',
  styleUrls: ['./beneficiaries-list-dialog.component.scss']
})
export class BeneficiariesListDialogComponent implements OnInit {
  displayedColumns: string[] = ['smme_name', 'status', 'actions'];
  dataSource: MatTableDataSource<any>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { beneficiaries: any[], eventDetails: any },
    private dialogRef: MatDialogRef<BeneficiariesListDialogComponent>,
    private router: Router
  ) {
    this.dataSource = new MatTableDataSource(data.beneficiaries || []);
  }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close();
  }

  getStatusClass(status: string): string {
    if (!status) return 'status-default';
    const normalized = status.toLowerCase();
    if (normalized.includes('active') || normalized.includes('appointed')) return 'status-active';
    if (normalized.includes('completed')) return 'status-completed';
    if (normalized.includes('dismissed')) return 'status-dismissed';
    return 'status-default';
  }

  exportToExcel(): void {
    console.log('Export to Excel clicked');
    try {
      // Excel sheet names are limited to 31 characters
      const courseName = this.data.eventDetails?.course_name || 'List';
      const sanitizedName = courseName.substring(0, 20); // Keep it short
      TableUtil.exportTableToExcel('beneficiariesListTable', `Event_Beneficiaries`);
    } catch (error) {
      console.error('Export to Excel failed:', error);
    }
  }

  exportToPDF(): void {
    console.log('Export to PDF clicked');
    try {
      // Remove existing event-info id from HTML to avoid conflicts
      const existingEventInfo = document.querySelector('.event-details-section');
      const hadId = existingEventInfo?.id === 'event-info';
      if (hadId && existingEventInfo) {
        existingEventInfo.removeAttribute('id');
      }
      
      // Create a temporary container with event details for PDF
      const tempContainer = document.createElement('div');
      tempContainer.style.display = 'none';
      tempContainer.id = 'event-info';
      
      // Add event details as span elements with textContent
      if (this.data.eventDetails) {
        const span1 = document.createElement('span');
        span1.textContent = this.data.eventDetails.programme_name || 'N/A';
        tempContainer.appendChild(span1);
        
        const span2 = document.createElement('span');
        span2.textContent = this.data.eventDetails.course_name || 'N/A';
        tempContainer.appendChild(span2);
        
        const span3 = document.createElement('span');
        span3.textContent = this.data.eventDetails.service_provider_name || 'N/A';
        tempContainer.appendChild(span3);
        
        const span4 = document.createElement('span');
        span4.textContent = this.data.eventDetails.event_date || 'N/A';
        tempContainer.appendChild(span4);
      }
      
      document.body.appendChild(tempContainer);
      
      const title = `Event Beneficiaries - ${this.data.eventDetails?.programme_name || 'Training Event'}`;
      TableUtil.exportTableToPDF('beneficiariesListTable', `Event_Beneficiaries`, title, 'p');
      
      // Cleanup
      tempContainer.remove();
      
      // Restore id if it was there
      if (hadId && existingEventInfo) {
        existingEventInfo.setAttribute('id', 'event-info');
      }
    } catch (error) {
      console.error('Export to PDF failed:', error);
    }
  }

  viewBeneficiaryDetails(beneficiary: any): void {
    console.log('View beneficiary clicked:', beneficiary);
    const beneficiaryId = beneficiary.smme_id || beneficiary.id;
    if (beneficiaryId) {
      // Close dialog and navigate to beneficiary detail page
      this.dialogRef.close();
      this.router.navigate(['/administration/beneficiaries', beneficiaryId]);
    } else {
      console.warn('No ID found for beneficiary:', beneficiary);
    }
  }
}
