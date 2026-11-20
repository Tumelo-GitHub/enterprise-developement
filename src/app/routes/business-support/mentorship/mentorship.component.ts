import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';
import { IMentorshipEvent } from 'src/app/shared';
import { MENTORSHIP_EVENT_STATUS } from 'src/app/shared/common/devwizarrd.constants';
import { MentorshipEventService } from '../services/mentorship-event.service';

@Component({
  selector: 'app-mentorship',
  templateUrl: './mentorship.component.html',
  styleUrls: ['./mentorship.component.scss']
})
export class MentorshipComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  mentorshipEvents: IMentorshipEvent[] = [];
  dataSource = new MatTableDataSource<IMentorshipEvent>([]);
  loading = false;
  searchTerm = '';
  showForm = false;
  editingMentorshipEvent: IMentorshipEvent | null = null;
  isEditMode = false;
  
  // Pagination settings
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  totalItems = 0;

  displayedColumns: string[] = [
    'programme_name',
    'mentor_name', 
    'address',
    'event_date',
    'event_time',
    'status',
    'beneficiaries_count',
    'actions'
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private mentorshipEventService: MentorshipEventService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadMentorshipEvents();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMentorshipEvents(): void {
    this.loading = true;
    this.mentorshipEventService.getAllMentorshipEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.mentorshipEvents = response.data;
          this.dataSource.data = this.mentorshipEvents;
          this.totalItems = this.mentorshipEvents.length;
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading mentorship events:', error);
          this.showSnackBar('Error loading mentorship events', 'error');
          this.loading = false;
        }
      });
  }

  onSearch(): void {
    this.applyFilter();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter();
  }

  private applyFilter(): void {
    const filterValue = this.searchTerm.trim().toLowerCase();
    this.dataSource.filter = filterValue;
    
    // Custom filter predicate for multiple fields
    this.dataSource.filterPredicate = (data: IMentorshipEvent, filter: string) => {
      const searchTerms = filter.split(' ');
      return searchTerms.every(term =>
        (data.programme_name || '').toLowerCase().includes(term) ||
        (data.mentor_name || '').toLowerCase().includes(term) ||
        (data.mentor_surname || '').toLowerCase().includes(term) ||
        data.address.toLowerCase().includes(term) ||
        data.event_date.toLowerCase().includes(term) ||
        (data.status_name || '').toLowerCase().includes(term) ||
        `${data.mentor_name} ${data.mentor_surname}`.toLowerCase().includes(term)
      );
    };

    // Reset to first page when filtering
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  showAddForm(): void {
    this.editingMentorshipEvent = null;
    this.isEditMode = false;
    this.showForm = true;
  }

  showEditForm(mentorshipEvent: IMentorshipEvent): void {
    this.editingMentorshipEvent = mentorshipEvent;
    this.isEditMode = true;
    this.showForm = true;
  }

  hideForm(): void {
    this.showForm = false;
    this.editingMentorshipEvent = null;
    this.isEditMode = false;
  }

  onSaveMentorshipEvent(data: Omit<IMentorshipEvent, 'id'> | Partial<IMentorshipEvent>): void {
    this.loading = true;

    if (this.isEditMode && this.editingMentorshipEvent) {
      // Update existing mentorship event
      const updateData = data as Partial<IMentorshipEvent>;
      this.mentorshipEventService.update(this.editingMentorshipEvent.id, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.showSnackBar('Mentorship event updated successfully', 'success');
            this.loadMentorshipEvents();
            this.hideForm();
          },
          error: (error: any) => {
            console.error('Error updating mentorship event:', error);
            this.showSnackBar('Error updating mentorship event', 'error');
            this.loading = false;
          }
        });
    } else {
      // Add new mentorship event
      const addData = data as Omit<IMentorshipEvent, 'id'>;
      this.mentorshipEventService.create(addData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.showSnackBar('Mentorship event created successfully', 'success');
            this.loadMentorshipEvents();
            this.hideForm();
          },
          error: (error: any) => {
            console.error('Error creating mentorship event:', error);
            this.showSnackBar('Error creating mentorship event', 'error');
            this.loading = false;
          }
        });
    }
  }

  deleteMentorshipEvent(mentorshipEvent: IMentorshipEvent): void {
    const mentorName = `${mentorshipEvent.mentor_name} ${mentorshipEvent.mentor_surname}`;
    if (confirm(`Are you sure you want to delete the mentorship event with ${mentorName}?`)) {
      this.loading = true;
      this.mentorshipEventService.delete(mentorshipEvent.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.showSnackBar('Mentorship event deleted successfully', 'success');
            this.loadMentorshipEvents();
          },
          error: (error: any) => {
            console.error('Error deleting mentorship event:', error);
            this.showSnackBar('Error deleting mentorship event', 'error');
            this.loading = false;
          }
        });
    }
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? 'snack-bar-success' : 'snack-bar-error'
    });
  }

  // Helper method for getting status name
  getStatusName(statusId: number): string {
    const status = MENTORSHIP_EVENT_STATUS.find(s => parseInt(s.id) === statusId);
    return status ? status.status_name : 'Unknown';
  }

  // Helper method for getting status badge class
  getStatusBadgeClass(statusId: number): string {
    switch (statusId) {
      case 1: return 'status-scheduled';
      case 2: return 'status-completed';
      case 3: return 'status-cancelled';
      case 4: return 'status-postponed';
      case 5: return 'status-in-progress';
      default: return 'status-unknown';
    }
  }

  // Helper method for formatting date
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  }

  // Helper method for formatting time
  formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  // Helper method for truncating long text
  truncateText(text: string, maxLength: number = 50): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  // Helper method to get beneficiaries count
  getBeneficiariesCount(beneficiaries: number[]): number {
    return Array.isArray(beneficiaries) ? beneficiaries.length : 0;
  }

}
