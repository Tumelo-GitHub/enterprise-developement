import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CoachingEventService } from '../services/coaching-event.service';
import { ICoachingEvent } from '../../../shared/interfaces';
import { COACHING_EVENT_STATUS_NAMES } from '../../../shared/common/coaching.constants';

@Component({
  selector: 'app-coaching',
  templateUrl: './coaching.component.html',
  styleUrls: ['./coaching.component.scss']
})
export class CoachingComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['programme_name', 'coach_name', 'address', 'event_date', 'event_time', 'smme_count', 'status', 'actions'];
  dataSource = new MatTableDataSource<ICoachingEvent>([]);
  
  showForm = false;
  isEditMode = false;
  editingCoachingEvent: ICoachingEvent | null = null;
  isLoading = true;
  searchValue = '';

  constructor(
    private coachingEventService: CoachingEventService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadCoachingEvents();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadCoachingEvents(): void {
    this.isLoading = true;
    this.coachingEventService.getAllCoachingEvents().subscribe({
      next: (response) => {
        this.dataSource.data = response.data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading coaching events:', error);
        this.showErrorMessage('Failed to load coaching events');
        this.isLoading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchValue = filterValue;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearSearch(): void {
    this.searchValue = '';
    this.dataSource.filter = '';
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  showAddForm(): void {
    this.showForm = true;
    this.isEditMode = false;
    this.editingCoachingEvent = null;
  }

  editCoachingEvent(coachingEvent: ICoachingEvent): void {
    this.showForm = true;
    this.isEditMode = true;
    this.editingCoachingEvent = { ...coachingEvent };
  }

  hideForm(): void {
    this.showForm = false;
    this.isEditMode = false;
    this.editingCoachingEvent = null;
  }

  onSaveCoachingEvent(coachingEventData: Omit<ICoachingEvent, 'id'> | Partial<ICoachingEvent>): void {
    if (this.isEditMode && this.editingCoachingEvent) {
      // Update existing coaching event
      this.coachingEventService.update(this.editingCoachingEvent.id, coachingEventData).subscribe({
        next: (response) => {
          this.showSuccessMessage('Coaching event updated successfully');
          this.hideForm();
          this.loadCoachingEvents();
        },
        error: (error) => {
          console.error('Error updating coaching event:', error);
          this.showErrorMessage('Failed to update coaching event');
        }
      });
    } else {
      // Create new coaching event
      this.coachingEventService.create(coachingEventData).subscribe({
        next: (response) => {
          this.showSuccessMessage('Coaching event created successfully');
          this.hideForm();
          this.loadCoachingEvents();
        },
        error: (error) => {
          console.error('Error creating coaching event:', error);
          this.showErrorMessage('Failed to create coaching event');
        }
      });
    }
  }

  deleteCoachingEvent(coachingEvent: ICoachingEvent): void {
    if (confirm(`Are you sure you want to delete the coaching event "${coachingEvent.programme_name}" scheduled for ${coachingEvent.event_date}?`)) {
      this.coachingEventService.delete(coachingEvent.id).subscribe({
        next: (response) => {
          this.showSuccessMessage('Coaching event deleted successfully');
          this.loadCoachingEvents();
        },
        error: (error) => {
          console.error('Error deleting coaching event:', error);
          this.showErrorMessage('Failed to delete coaching event');
        }
      });
    }
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 1: return 'status-scheduled';
      case 2: return 'status-in-progress';
      case 3: return 'status-completed';
      case 4: return 'status-cancelled';
      case 5: return 'status-postponed';
      default: return 'status-unknown';
    }
  }

  getStatusName(status: number): string {
    return COACHING_EVENT_STATUS_NAMES[status] || 'Unknown';
  }

  getSMMECount(smmeArray: number[]): number {
    return smmeArray ? smmeArray.length : 0;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    // Handle time format (assumes HH:mm format)
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: 'snack-bar-success'
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: 'snack-bar-error'
    });
  }
}
