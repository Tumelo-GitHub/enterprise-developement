import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from 'src/app/shared/services/toast.service';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';
import { TextUtil } from 'src/app/shared/utils/textUtil';
import { TableUtil } from 'src/app/shared/utils/tableUtil';
import { TrainingEventService } from '../../services/training-event.service';
import { CONFIRM_DELETE_MESSAGE, DELETE_TITLE } from 'src/app/shared/common/devwizarrd.constants';
import { MatDialog } from '@angular/material/dialog';
import { BeneficiariesListDialogComponent } from './beneficiaries-list-dialog/beneficiaries-list-dialog.component';
import { TrainingEventInvitationService } from '../../services/training-event-invitation.service';

@Component({
  selector: 'app-training-event',
  templateUrl: './training-event.component.html',
  styleUrls: ['./training-event.component.scss']
})
export class TrainingEventComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() onRegisterView: EventEmitter<number[]> = new EventEmitter();
  @Output() onAddEvent: EventEmitter<void> = new EventEmitter();
  @Output() onEditEvent: EventEmitter<any> = new EventEmitter();
  @Output() onDataLoaded: EventEmitter<void> = new EventEmitter();
  
  // Table configuration
  displayedColumns: string[] = [
    'select', 'programme_name', 'service_provider_name', 'course_name', 
    'address', 'event_date', 'time', 'status_name', 'actions'
  ];
  dataSource = new MatTableDataSource<any>([]);
  selection = new SelectionModel<any>(true, []);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  // State management
  events: any[] = [];
  isLoading: boolean = false;
  searchTerm: string = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    private toast: ToastService,
    private notificationUtil: NotificationUtil,
    private trainingEventService: TrainingEventService,
    private dialog: MatDialog,
    private router: Router,
    private invitationService: TrainingEventInvitationService
  ) { }

  ngOnInit(): void {
    this.loadEvents();
    this.setupFilter();
  }

  ngAfterViewInit(): void {
    this.connectPaginationAndSort();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Data management
  loadEvents(): void {
    this.isLoading = true;
    this.trainingEventService.getTrainingEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp) => {
          this.events = resp.data || [];
          this.dataSource.data = this.events;
          // Connect paginator and sort after data is set using setTimeout
          this.connectPaginationAndSort();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading training events:', err);
          this.notificationUtil.showError('Failed to load training events');
          // Connect paginator and sort even on error
          this.connectPaginationAndSort();
          this.isLoading = false;
        }
      });
  }

  private connectPaginationAndSort(): void {
    setTimeout(() => {
      if (this.dataSource && this.paginator && this.sort) {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    }, 100);
  }

  private setupFilter(): void {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchStr = filter.toLowerCase();
      return data.programme_name?.toLowerCase().includes(searchStr) ||
             data.service_provider_name?.toLowerCase().includes(searchStr) ||
             data.course_name?.toLowerCase().includes(searchStr) ||
             data.address?.toLowerCase().includes(searchStr) ||
             data.status_name?.toLowerCase().includes(searchStr);
    };
  }

  // Search functionality
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyFilterFromEvent(event: Event): void {
    this.applyFilter(event);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.dataSource.filter = '';
  }

  // Form management
  openDialog(data: any = null): void {
    if (data) {
      this.onEditEvent.emit(data);
    } else {
      this.onAddEvent.emit();
    }
  }

  // View beneficiaries
  viewBeneficiaries(event: any): void {
    if (!event.id) {
      this.notificationUtil.showError('Event ID is missing');
      return;
    }

    this.isLoading = true;
    this.invitationService.getEventInvitations(event.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp) => {
          this.isLoading = false;
          const beneficiaries = resp.data || [];
          this.dialog.open(BeneficiariesListDialogComponent, {
            width: '900px',
            maxWidth: '95vw',
            maxHeight: '90vh',
            data: {
              beneficiaries: beneficiaries,
              eventDetails: event
            }
          });
        },
        error: (err) => {
          console.error('Error fetching beneficiaries:', err);
          this.isLoading = false;
          this.notificationUtil.showError('Failed to load beneficiaries');
        }
      });
  }

  // Delete event
  deleteEmp(event: any): void {
    this.toast.openConfirmBox('danger', DELETE_TITLE, CONFIRM_DELETE_MESSAGE).subscribe(
      (resp: any) => {
        if (resp.success) {
          this.trainingEventService.delete(event.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: resp => {
                this.notificationUtil.showSuccess(resp.message || 'Training event deleted successfully');
                const index = this.events.findIndex(e => e.id === event.id);
                if (index >= 0) {
                  this.events.splice(index, 1);
                  this.dataSource.data = this.events;
                }
              },
              error: err => {
                console.error('Error deleting event:', err);
                this.notificationUtil.showError('Failed to delete training event');
              }
            });
        }
      }
    );
  }

  // Utility methods
  formatDate(date: string): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  truncateText(text: string, length: number): string {
    return TextUtil.truncateText(text, length);
  }

  // Selection methods
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id}`;
  }

  // Register management
  viewRegister(): void {
    const selectedIds = this.selection.selected.map(x => x.id);
    if (selectedIds.length === 0) {
      this.notificationUtil.showInfo('Please select at least one event');
      return;
    }
    this.onRegisterView.emit(selectedIds);
  }

  viewSingleRegister(event: any): void {
    this.onRegisterView.emit([event.id]);
  }

  viewInvitations(event: any): void {
    console.log('Navigating to invitations for event:', event.id);
    this.router.navigate(['/support/training', event.id, 'invitations']);
  }

  getStatusClass(status: string): string {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('complete') || statusLower.includes('done')) {
      return 'status-completed';
    } else if (statusLower.includes('scheduled')) {
      return 'status-scheduled';
    } else if (statusLower.includes('requested')) {
      return 'status-requested';
    } else if (statusLower.includes('postpone')) {
      return 'status-postponed';
    } else if (statusLower.includes('cancel')) {
      return 'status-cancelled';
    }
    return 'status-default';
  }

  // Export methods
  exportToExcel(): void {
    TableUtil.exportTableToExcel('TrainingEventsTable', 'Training_Events');
  }

  exportToPDF(): void {
    TableUtil.exportTableToPDF('TrainingEventsTable', 'Training_Events', 'Training Events', 'l');
  }
}
