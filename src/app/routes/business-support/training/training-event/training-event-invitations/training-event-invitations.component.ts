import { Component, Input, OnInit, SimpleChanges, ViewChild, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastService } from 'src/app/shared/services/toast.service';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';
import { TrainingEventInvitationService, ITrainingEventInvitation } from '../../../services/training-event-invitation.service';
import { TrainingEventRegisterService } from '../../../services/training-event-register.service';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-training-event-invitations',
  templateUrl: './training-event-invitations.component.html',
  styleUrls: ['./training-event-invitations.component.scss']
})
export class TrainingEventInvitationsComponent implements OnInit, AfterViewInit {
  @Input() trainingEvent: any;
  @Output() showForm = new EventEmitter<any>();
  @Output() editForm = new EventEmitter<any>();
  
  displayedColumns: string[] = ['select', 'smme_name', 'invitation_status', 'invited_at', 'response_at', 'notes', 'action'];
  columnsToDisplay: string[] = this.displayedColumns;
  dataSource!: MatTableDataSource<ITrainingEventInvitation>;
  invitations: ITrainingEventInvitation[] = [];
  isLoading = false;
  isAutoFilling = false; // Prevent multiple autofill executions
  selection = new SelectionModel<ITrainingEventInvitation>(true, []);
  stats: any = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private invitationService: TrainingEventInvitationService,
    private registerService: TrainingEventRegisterService,
    private toast: ToastService,
    private notificationUtil: NotificationUtil,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.trainingEvent) {
      this.loadInvitations(this.trainingEvent);
      this.loadStats(this.trainingEvent.id);
    }
  }

  ngAfterViewInit(): void {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['trainingEvent'] && changes['trainingEvent'].currentValue && 
        changes['trainingEvent'].currentValue !== changes['trainingEvent'].previousValue) {
      const currentId = changes['trainingEvent'].currentValue?.id;
      const previousId = changes['trainingEvent'].previousValue?.id;
      
      if (currentId !== previousId) {
        this.loadInvitations(changes['trainingEvent'].currentValue);
        this.loadStats(currentId);
      }
    }
  }

  loadInvitations(event: any) {
    if (event && event.id) {
      this.isLoading = true;
      this.invitationService.getEventInvitations(event.id).subscribe({
        next: response => {
          this.invitations = response.data || [];
          this.dataSource = new MatTableDataSource(this.invitations);
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }
          this.isLoading = false;
          this.selection.clear();
        },
        error: err => {
          console.error('Error loading invitations:', err);
          this.notificationUtil.showError('Failed to load invitations');
          this.isLoading = false;
        }
      });
    }
  }

  loadStats(eventId: number) {
    this.invitationService.getEventInvitationStats(eventId).subscribe({
      next: response => {
        // Handle array response from API
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          this.stats = response.data[0];
          // Convert string values to numbers for proper display
          if (this.stats) {
            this.stats.total_invitations = parseInt(this.stats.total_invitations) || 0;
            this.stats.invited = parseInt(this.stats.invited) || 0;
            this.stats.confirmed = parseInt(this.stats.confirmed) || 0;
            this.stats.declined = parseInt(this.stats.declined) || 0;
            this.stats.attended = parseInt(this.stats.attended) || 0;
            this.stats.cancelled = parseInt(this.stats.cancelled) || 0;
          }
        } else {
          this.stats = response.data;
        }
      },
      error: err => {
        console.error('Error loading stats:', err);
        console.error('Error loading stats:', err);
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

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'invited':
        return 'status-invited';
      case 'confirmed':
        return 'status-confirmed';
      case 'attended':
        return 'status-attended';
      case 'declined':
        return 'status-declined';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-unknown';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  }

  openAddInvitationForm() {
    this.showForm.emit({ training_event_id: this.trainingEvent?.id });
  }

  openReminderForm() {
    this.showForm.emit({ 
      training_event_id: this.trainingEvent?.id, 
      mode: 'reminder' 
    });
  }

  sendIndividualReminder(invitation: ITrainingEventInvitation) {
    this.invitationService.sendReminder(invitation.id!, 'both').subscribe({
      next: (response) => {
        this.notificationUtil.showSuccess(
          response.message || `Reminder sent to ${invitation.smme_name}`
        );
      },
      error: (err) => {
        console.error('Error sending reminder:', err);
        this.notificationUtil.showError('Failed to send reminder');
      }
    });
  }

  editInvitation(invitation: ITrainingEventInvitation) {
    this.editForm.emit({ invitation, training_event_id: this.trainingEvent?.id });
  }

  deleteInvitation(invitation: ITrainingEventInvitation) {
    const index = this.invitations.indexOf(invitation);
    this.toast.openConfirmBox('danger', 'Remove Invitation', 'Are you sure you want to remove this invitation?').subscribe(
      resp => {
        if (resp.success) {
          this.invitationService.deleteInvitation(invitation.id!).subscribe({
            next: response => {
              this.notificationUtil.showSuccess(response.message || 'Invitation removed successfully');
              this.invitations.splice(index, 1);
              this.dataSource = new MatTableDataSource(this.invitations);
              this.loadStats(this.trainingEvent.id);
            },
            error: err => {
              this.notificationUtil.showError('Failed to remove invitation');
              console.error(err);
            }
          });
        }
      }
    );
  }

  // Selection methods
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource?.data.length || 0;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource?.data.forEach(row => this.selection.select(row));
  }

  bulkDelete() {
    const selectedIds = this.selection.selected.map(inv => inv.id!);
    if (selectedIds.length === 0) {
      this.notificationUtil.showWarning('Please select invitations to remove');
      return;
    }

    this.toast.openConfirmBox('danger', 'Remove Invitations', 
      `Are you sure you want to remove ${selectedIds.length} invitation(s)?`).subscribe(
      resp => {
        if (resp.success) {
          this.invitationService.bulkDeleteInvitations(selectedIds).subscribe({
            next: response => {
              this.notificationUtil.showSuccess(`${selectedIds.length} invitation(s) removed successfully`);
              this.loadInvitations(this.trainingEvent);
              this.loadStats(this.trainingEvent.id);
            },
            error: err => {
              this.notificationUtil.showError('Failed to remove invitations');
              console.error(err);
            }
          });
        }
      }
    );
  }

  updateStatus(invitation: ITrainingEventInvitation, newStatus: ITrainingEventInvitation['invitation_status']) {
    this.invitationService.updateInvitationStatus(invitation.id!, newStatus).subscribe({
      next: response => {
        this.notificationUtil.showSuccess('Status updated successfully');
        this.loadInvitations(this.trainingEvent);
        this.loadStats(this.trainingEvent.id);
      },
      error: err => {
        this.notificationUtil.showError('Failed to update status');
        console.error(err);
      }
    });
  }

  getConfirmedCount(): number {
    return this.invitations.filter(inv => 
      inv.invitation_status === 'confirmed' || inv.invitation_status === 'attended'
    ).length;
  }

  autoFillRegister() {
    // Prevent multiple executions
    if (this.isAutoFilling) {
      this.notificationUtil.showWarning('Auto-fill process is already running');
      return;
    }

    const confirmedCount = this.getConfirmedCount();

    if (confirmedCount === 0) {
      this.notificationUtil.showWarning('No confirmed beneficiaries found to add to register');
      return;
    }

    // Show confirmation dialog
    this.toast.openConfirmBox(
      'info', 
      'Auto-fill Training Register', 
      `Add all ${confirmedCount} confirmed beneficiaries to the training register for this event?`
    ).subscribe(
      resp => {
        if (resp.success) {
          this.processAutoFillRegister();
        }
      }
    );
  }

  private processAutoFillRegister() {
    this.isAutoFilling = true;
    this.isLoading = true;
    
    // Single API call - backend handles everything
    this.registerService.autoFillFromInvitations(this.trainingEvent.id).subscribe({
      next: (response) => {
        this.isAutoFilling = false;
        this.isLoading = false;
        
        // Show success message with navigation option
        this.notificationUtil.showSuccess(
          response.message || 'Successfully added confirmed beneficiaries to the register'
        );
        
        // Ask user if they want to navigate to register
        this.toast.openConfirmBox(
          'info',
          'Navigate to Register',
          'Auto-fill completed successfully. Would you like to view the training register now?'
        ).subscribe(navResponse => {
          if (navResponse.success) {
            this.navigateToRegister();
          }
        });
      },
      error: (error) => {
        this.isAutoFilling = false;
        this.isLoading = false;
        
        console.error('Auto-fill register failed:', error);
        this.notificationUtil.showError(
          error.error?.message || 'Failed to auto-fill register'
        );
      }
    });
  }

  navigateToRegister() {
    // Navigate to register page with current event pre-selected
    this.router.navigate(['/support/training/register'], {
      queryParams: { eventIds: this.trainingEvent.id }
    });
  }
}
