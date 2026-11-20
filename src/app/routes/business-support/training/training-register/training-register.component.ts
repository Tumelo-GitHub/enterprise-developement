import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastService } from 'src/app/shared/services/toast.service';
import { TrainingEventRegisterService } from '../../services/training-event-register.service';
import { TrainingEventService } from '../../services/training-event.service';
import { CONFIRM_DELETE_MESSAGE, DELETE_TITLE } from 'src/app/shared/common/devwizarrd.constants';
import { TableUtil } from 'src/app/shared/utils/tableUtil';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-training-register',
  templateUrl: './training-register.component.html',
  styleUrls: ['./training-register.component.scss']
})
export class TrainingRegisterComponent implements OnInit {
  @Input() event_ids: number[] = [];
  @Output() onAddRegister = new EventEmitter<number>();
  @Output() onEditRegister = new EventEmitter<any>();
  
  displayedColumns: string[] = ['smme_name', 'registered', 'attendee', 'email', 'tel_number', 'gender', 'age', 'qualification', 'black_owned', 'woman_owned', 'youth_owned', 'disabled_owned', 'location_type', 'programme', 'course', 'venue_name', 'event_date', 'industry', 'products', 'contact_name', 'contact_tel', 'contact_cell', 'contact_position', 'contact_email', 'action'];
  columnsToDisplay: string[] = ['smme_name', 'attendee', 'email', 'tel_number', 'programme', 'venue_name', 'contact_name', 'contact_tel', 'contact_email', 'action'];
  dataSource!: MatTableDataSource<any>;
  register: any[] = [];
  btnState: boolean = true;
  eventDetails: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  columns = new FormControl('');
  columnsList = [
    [
      'Smme Name',
      'smme_name'
    ],
    [
      'Registered',
      'registered'
    ],
    [
      'Attendee Full Names',
      'attendee'
    ],
    [
      'Attendee Email',
      'email'
    ],
    [
      'Attendee Tell Number',
      'tel_number'
    ],
    [
      'Gender',
      'gender'
    ],
    [
      'Age',
      'age'
    ],
    [
      'Qualification',
      'qualification'
    ],
    [
      'Black Owned',
      'black_owned'
    ],
    [
      'Woman Owned',
      'woman_owned'
    ],
    [
      'Youth Owned',
      'youth_owned'
    ],
    [
      'Disabled Owned',
      'disabled_owned'
    ],
    [
      'Location Type',
      'location_type'
    ],
    [
      'Programme',
      'programme'
    ],
    [
      'Course',
      'course'
    ],
    [
      'Event Venue',
      'venue_name'
    ],
    [
      'Event Date',
      'event_date'
    ],
    [
      'Industry',
      'industry'
    ],
    [
      'Products & Services',
      'products'
    ],
    [
      'Contact Person',
      'contact_name'
    ],
    [
      'SMME Tell',
      'contact_tel'
    ],
    [
      'SMME Cell',
      'contact_cell'
    ],
    [
      'Contact Person Position',
      'contact_position'
    ],
    [
      'SMME Email',
      'contact_email'
    ],
    [
      'Action',
      'action'
    ]
  ]

  constructor(
    private toast: ToastService,
    private trainingRegisterService: TrainingEventRegisterService,
    private trainingEventService: TrainingEventService
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    const newEventIds = changes['event_ids'].currentValue;
    
    // Set initial event details while loading
    if (newEventIds && newEventIds.length === 1) {
      this.eventDetails = 'Training Event'; // Show default while loading
    } else if (newEventIds && newEventIds.length > 1) {
      this.eventDetails = `${newEventIds.length} Training Events`; // Show count while loading
    }
    
    this.getEventRegister(newEventIds);
    this.btnState = (newEventIds.length > 1 || newEventIds.length == 0) ? true : false;
  }

  getEventRegister(id: number[]) {
    if (id.length > 0) {
      this.trainingRegisterService.getTrainingRegister(id).subscribe({
        next: response => {
          this.register = response.data;
          this.dataSource = new MatTableDataSource(this.register);
          // Connect paginator and sort after data is set using setTimeout
          this.connectPaginationAndSort();
          
          // Set event details for display
          if (this.register.length > 0) {
            const firstRecord = this.register[0];
            
            // Try different field name variations
            const programme = firstRecord.programme || firstRecord.programme_name || firstRecord.program || 'Unknown Programme';
            const course = firstRecord.course || firstRecord.course_name || 'Unknown Course';
            const venue = firstRecord.venue_name || firstRecord.venue || '';
            const eventDate = firstRecord.event_date || '';
            
            if (id.length === 1) {
              // Single event: show programme, course, venue and date
              this.eventDetails = `${programme} - ${course}`;
              if (venue) {
                this.eventDetails += ` @ ${venue}`;
              }
              if (eventDate) {
                this.eventDetails += ` (${eventDate})`;
              }
            } else {
              // Multiple events: show count and programme
              const uniqueProgrammes = [...new Set(this.register.map(r => r.programme || r.programme_name || 'Unknown'))];
              if (uniqueProgrammes.length === 1) {
                this.eventDetails = `${id.length} Training Events - ${uniqueProgrammes[0]}`;
              } else {
                this.eventDetails = `${id.length} Training Events - Multiple Programmes`;
              }
            }
          } else {
            // No registrations found - fetch event details from training event service
            if (id.length === 1) {
              this.trainingEventService.getTrainingEvent(id[0]).subscribe({
                next: (eventResponse: any) => {
                  const event = eventResponse.data;
                  const programme = event.programme_name || event.programme || 'Unknown Programme';
                  const course = event.course_name || event.course || 'Unknown Course';
                  const venue = event.venue_name || event.venue || '';
                  const eventDate = event.event_date || '';
                  
                  this.eventDetails = `${programme} - ${course}`;
                  if (venue) {
                    this.eventDetails += ` @ ${venue}`;
                  }
                  if (eventDate) {
                    this.eventDetails += ` (${eventDate})`;
                  }
                },
                error: (err) => {
                  this.eventDetails = 'Training Event';
                }
              });
            } else {
              // Multiple events with no registrations
              this.eventDetails = `${id.length} Training Events`;
            }
          }
        },
        error: (err) => {
          console.error('Error loading register:', err);
        }
      });
    }
  }

  selectedToppings(columns: any) {
    this.columnsToDisplay = columns.value;
  }

  private connectPaginationAndSort(): void {
    setTimeout(() => {
      if (this.dataSource && this.paginator && this.sort) {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    }, 100);
  }

  exportTable() {
    TableUtil.exportTableToExcel("TrainingEventRegisterTable", "Training Register");
  }

  openDialog(data: any = {}) {
    if (Object.keys(data).length === 0) {
      // Add new registration
      this.onAddRegister.emit(this.event_ids[0]);
    } else {
      // Edit existing registration
      this.onEditRegister.emit(data);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyFilterFromEvent(event: Event): void {
    this.applyFilter(event);
  }

  exportTableToPDF() {
    TableUtil.exportTableToPDF("TrainingEventRegisterTable", "Training_Event_Register", "Training Event Register", "l");
  }

  deleteRecord (row: any) {
    const index = this.register.indexOf(row);
    this.toast.openConfirmBox('danger', DELETE_TITLE, CONFIRM_DELETE_MESSAGE).subscribe(
      resp => {
        if (resp.success) {
          this.trainingRegisterService.delete(row.id).subscribe({
            next: resp => {
              this.toast.toastNotification('success', resp.message, '');
              this.register.splice(index, 1);
              this.dataSource = new MatTableDataSource(this.register);
            },
            error: console.log
          })
        }
      }
    )
  }

  // Helper methods for event info display in PDF/Excel
  getProgrammeInfo(): string {
    // Only show details for single event
    if (this.event_ids.length !== 1 || this.register.length === 0) {
      return '';
    }
    return this.register[0].programme || this.register[0].programme_name || '';
  }

  getCourseInfo(): string {
    // Only show details for single event
    if (this.event_ids.length !== 1 || this.register.length === 0) {
      return '';
    }
    return this.register[0].course || this.register[0].course_name || '';
  }

  getServiceProviderInfo(): string {
    // Only show details for single event
    if (this.event_ids.length !== 1 || this.register.length === 0) {
      return '';
    }
    console.log(this.register[0]);
    return this.register[0].service_provider || this.register[0].provider || '';
  }

  getEventDateInfo(): string {
    // Only show details for single event
    if (this.event_ids.length !== 1 || this.register.length === 0) {
      return '';
    }
    return this.register[0].event_date || '';
  }
}
