import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastService } from 'src/app/shared/services/toast.service';
import { TimesheetFormComponent } from './timesheet-form/timesheet-form.component';
import { TimesheetService } from '../services/timesheet.service';
import { ITimesheet, IUser } from 'src/app/shared';
import * as moment from 'moment';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TableUtil } from 'src/app/shared/utils/tableUtil';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from 'src/app/core';
import { TimesheetInvoiceComponent } from './timesheet-invoice/timesheet-invoice.component';

@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.scss']
})
export class TimesheetComponent implements OnInit {
  displayedColumns: string[] = ['date', 'project', 'company', 'general_activity', 'work_type', 'time', 'comment', 'employee', 'action'];
  columnsToDisplay: string[] = ['date', 'project', 'company', 'general_activity', 'work_type', 'time', 'comment', 'action'];
  dataSource!: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  timesheet: ITimesheet[] = [];
  columns = new FormControl('');
  companies: any[] = [];
  form: FormGroup;
  user!: IUser;
  hourlyRate: number = 10;
  columnList = [
    [
      'date',
      'Date'
    ],
    [
      'project',
      'Project',
    ],
    [
      'company',
      'Company',
    ],
    [
      'general_activity',
      'General Activity',
    ],
    [
      'work_type',
      'Work Type',
    ],
    [
      'time',
      'Time',
    ],
    [
      'comment',
      'Comment',
    ],
    [
      'employee',
      'Employee',
    ],
    [
      'action',
      'Action',
    ]
  ];
  disbursmentItems: any[] = [];

  users: IUser[] = [];

  constructor(
    private _timesheetService: TimesheetService,
    public dialog: MatDialog,
    private toast: ToastService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private fb: FormBuilder,
    private auth: AuthService
  ) {
    this.matIconRegistry.addSvgIcon(
      `excel`,
      this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/images/microsoft-excel-icon.svg")
    );

    this.form = this.fb.group({
      start_date: [null],
      end_date: [null],
      user_id: [null],
      company_id: [null],
      work_type: [null]
    });
  }

  ngOnInit(): void {
    this.applyFilters()
    this.getCompanies();
    // get logged in user details
    this.auth.user().subscribe(user => {
      if (user) {
        this.user = user;
      }
      console.log(user);
      if (user?.role === 'admin') {
        this.getUsers();
      }
    });
  }

  removeColumn() {
    if (this.columnsToDisplay.length) {
      this.columnsToDisplay.pop();
    }
  }

  selectedColumns(column: any) {
    this.columnsToDisplay = column.value;
  }

  exportTableToCSV() {
    TableUtil.exportTableToExcel("timesheet", "Timesheet");
  }

  exportTableToPDF() {
    // TODO: check if employee name is available and use it as the file name
    TableUtil.exportTableToPDF("timesheet", this.timesheet[0].first_name + " Timesheet", this.timesheet[0].first_name + " Timesheet", "l");
  }

  getUserTimesheet(form: any) {
    this._timesheetService.getTimesheet(form).subscribe({
      next: resp => {
        this.timesheet = resp.data.timesheetItems;
        this.disbursmentItems = resp.data.disbursementItems;
        this.updateTable();
      },
      error: (err) => {
        console.error('Error fetching timesheet:', err);
        this.toast.toastNotification('danger', 'Error', 'Failed to fetch timesheet.');
      }
    })
  }

  getCompanies(): void {
    this._timesheetService.getCompanies(1).subscribe({
      next: resp => {
        this.companies = resp.data;
      },
      error: (err) => {
        console.error('Error fetching companies:', err);
        this.toast.toastNotification('danger', 'Error', 'Failed to fetch companies.');
      }
    });

  }

  getUsers(): void {
    if (this.users.length) {
      return;
    }

    this.auth.getAllUsers().subscribe({
      next: resp => {
        this.users = resp.data;
      },
      error: console.log
    });
  }

  openDialog(data: any = {}) {
    const index = this.timesheet.indexOf(data);

    const dialogRef = this.dialog.open(TimesheetFormComponent, {
      data,
      panelClass: 'form-dialog'
    });
    dialogRef.afterClosed().subscribe((result: ITimesheet) => {
      if (result) {
        if (index >= 0) {
          this.timesheet[index] = result;
        } else {
          this.timesheet.push(result);
        }
        this.updateTable();
      }
    });
  }

  openInvoiceDialog() {
    // check if we have any timesheet entries
    if (!this.timesheet.length) {
      this.toast.toastNotification('danger', 'Error', 'No timesheet entries to generate invoice.');
      return;
    }

    
    let employeeName =  '';

    if (this.form.value['user_id']) {
      const employeeFirstName = this.users.find(u => u.id === this.form.value['user_id'])?.first_name;
      const employeeLastName = this.users.find(u => u.id === this.form.value['user_id'])?.last_name;
      employeeName = employeeFirstName && employeeLastName ? `${employeeFirstName} ${employeeLastName}` : '';
    } else {
      employeeName = this.user.first_name + ' ' + this.user.last_name;
    }

    const dialogRef = this.dialog.open(TimesheetInvoiceComponent, {
      data: {
        timesheet: this.timesheet,
        disbursmentItems: this.disbursmentItems,
        employee_name: employeeName,
        startDate: this.form.value['start_date'],
        endDate: this.form.value['end_date']
      },
      panelClass: 'form-dialog'
    });
    dialogRef.afterClosed().subscribe((result: ITimesheet) => {
      
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteItem(id: number) {
    const index = this.timesheet.findIndex(t => t.id === id);

    this.toast.openConfirmBox('danger', 'Delete', 'Are you sure you want to delete this company?').subscribe(
      resp => {
        if (resp.success) {
          this._timesheetService.delete(id).subscribe({
            next: resp => {
              this.toast.toastNotification('success', 'Company successfully deleted', '');
              this.timesheet.splice(index, 1);
              this.updateTable();
            },
            error: (err) => {
              console.error('Error deleting timesheet entry:', err);
              this.toast.toastNotification('danger', 'Error', 'Failed to delete timesheet entry.');
            }
          })
        }
      }
    )
  }

  getTotalDuration() {
    let totalDuration: moment.Duration = moment.duration('00:00:00');

    this.timesheet.forEach(entry => {
      totalDuration.add(moment.duration(entry.duration));
    });

    // add 2 time values together using moment.js
    // const totalDuration = moment.duration('00:30:00').add(moment.duration('01:30:00'));
    return moment.utc(totalDuration.asMilliseconds()).format('HH:mm:ss');
  }
  

  

  applyFilters(): void {
    const startDate = this.form.value['start_date'];
    const endDate = this.form.value['end_date'];

    if (startDate && endDate) {
      this.form.controls['start_date'].setValue(moment(startDate).format('YYYY-MM-DD'));
      this.form.controls['end_date'].setValue(moment(endDate).format('YYYY-MM-DD'));
      console.log(this.form.value);
    }
    this.getUserTimesheet(this.form.value);
  }

  private updateTable() {
    this.dataSource = new MatTableDataSource(this.timesheet);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getDisburstmentItems(event: any) {
    console.log(event);
    this.disbursmentItems = event;
  }
}
