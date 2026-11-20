import { Component, EventEmitter, OnInit, Output, ViewChild, OnDestroy, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/shared/services/toast.service';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';
import { ProgrammeService } from '../../services/programme.service';
import { TableUtil } from 'src/app/shared/utils/tableUtil';
import { IProgramme } from 'src/app/shared';

@Component({
  selector: 'app-programme-table',
  templateUrl: './programme-table.component.html',
  styleUrls: ['./programme-table.component.scss']
})
export class ProgrammeTableComponent implements OnInit, OnDestroy {
  @Input() showForm = false;
  
  displayedColumns: string[] = ['programme_name', 'description', 'programme_type', 'generic_company_id', 'start_date', 'end_date', 'action'];
  columnsToDisplay: string[] = ['programme_name', 'description', 'programme_type', 'generic_company_id', 'start_date', 'end_date', 'action'];
  dataSource!: MatTableDataSource<IProgramme>;
  programmeList: IProgramme[] = [];
  selectedRow?: IProgramme;
  loading = false;
  searchTerm = '';

  // Event emitters for modern navigation
  @Output() onProgrammeSelection: EventEmitter<IProgramme | undefined> = new EventEmitter();
  @Output() showCourses: EventEmitter<IProgramme> = new EventEmitter();
  @Output() showBeneficiaries: EventEmitter<IProgramme> = new EventEmitter();
  @Output() showBdsp: EventEmitter<IProgramme> = new EventEmitter();
  @Output() showDocuments: EventEmitter<IProgramme> = new EventEmitter();
  @Output() toggleForm: EventEmitter<any> = new EventEmitter();
  @Output() editForm: EventEmitter<IProgramme> = new EventEmitter();

  private destroy$ = new Subject<void>();

  columns = new FormControl('');
  columnsList = [
    ['Programme Name', 'programme_name'],
    ['Description', 'description'],
    ['Programme Type', 'programme_type'],
    ['Generic Company', 'generic_company_id'],
    ['Start Date', 'start_date'],
    ['End Date', 'end_date'],
    ['Action', 'action']
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private toast: ToastService,
    private notification: NotificationUtil,
    private programmeService: ProgrammeService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getProgrammeList();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  exportTable() {
    TableUtil.exportTableToExcel("ExampleMaterialTable", "Programmes");
  }

  removeColumn() {
    if (this.columnsToDisplay.length) {
      this.columnsToDisplay.pop();
    }
  }

  selectedColumns(columns: any) {
    this.columnsToDisplay = columns.value;
  }

  getProgrammeList() {
    this.loading = true;
    this.programmeService.getProgrammes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp) => {
          this.programmeList = resp.data;
          this.updateTable();
          this.loading = false;
        },
        error: (err) => {
          this.notification.showError('Error loading programmes');
          console.error('Error loading programmes:', err);
          this.loading = false;
        }
      });
  }

  private updateTable() {
    this.dataSource = new MatTableDataSource(this.programmeList);
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
    });
  }

  // Navigation methods
  viewCourses(programme: IProgramme, event: Event) {
    event.stopPropagation();
    this.showCourses.emit(programme);
  }

  viewBeneficiaries(programme: IProgramme, event: Event) {
    event.stopPropagation();
    this.showBeneficiaries.emit(programme);
  }

  viewBdsp(programme: IProgramme, event: Event) {
    event.stopPropagation();
    this.showBdsp.emit(programme);
  }

  viewDocuments(programme: IProgramme, event: Event) {
    event.stopPropagation();
    this.showDocuments.emit(programme);
  }

  // Form methods
  addProgramme() {
    this.router.navigate(['/administration/programme/new']);
  }

  editProgramme(programme: IProgramme, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/administration/programme', programme.id]);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchTerm = filterValue;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyFilterFromEvent(event: Event) {
    this.applyFilter(event);
  }

  clearSearch() {
    this.searchTerm = '';
    this.dataSource.filter = '';
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  delete(programme: IProgramme, event: Event) {
    event.stopPropagation();
    const index = this.programmeList.indexOf(programme);
    
    this.toast.openConfirmBox('danger', 'Delete', `Are you sure you want to delete ${programme.programme_name}?`).subscribe(
      resp => {
        if (resp.success) {
          this.programmeService.delete(programme.id).subscribe({
            next: resp => {
              this.notification.showSuccess('Programme deleted successfully');
              this.programmeList.splice(index, 1);
              this.updateTable();
            },
            error: (err) => {
              this.notification.showError('Error deleting programme');
              console.error('Error deleting programme:', err);
            }
          });
        }
      }
    );
  }

  getSelectedRow(row: IProgramme) {
    this.selectedRow = row;
    this.onProgrammeSelection.emit(row);
  }

  // Methods for parent component to update list
  addProgrammeToList(programme: IProgramme) {
    this.programmeList.push(programme);
    this.updateTable();
  }

  updateProgrammeInList(programme: IProgramme) {
    const index = this.programmeList.findIndex(p => p.id === programme.id);
    if (index >= 0) {
      this.programmeList[index] = programme;
      this.updateTable();
    }
  }

  // Public method to refresh the list
  refreshProgrammeList() {
    this.getProgrammeList();
  }
}
