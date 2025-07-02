import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-timesheet-manager',
  templateUrl: './timesheet-manager.component.html',
  styleUrls: ['./timesheet-manager.component.scss']
})
export class TimesheetManagerComponent implements OnInit {

  displayedColumns: string[] = ['project_name', 'company_name', 'status', 'action'];
  dataSource!: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  timesheet_data = [
    {
      id: 1,
      project_id: 1,
      project_name: 'Project 1',
      company_id: 1,
      company_name: 'Company 1',
      status: 'Active'
    },
    {
      id: 2,
      project_id: 2,
      project_name: 'Project 2',
      company_id: 2,
      company_name: 'Company 2',
      status: 'Active'
    },
    {
      id: 3,
      project_id: 3,
      project_name: 'Project 3',
      company_id: 3,
      company_name: 'Company 3',
      status: 'Active'
    },
    {
      id: 4,
      project_id: 4,
      project_name: 'Project 4',
      company_id: 4,
      company_name: 'Company 4',
      status: 'Active'
    },
    {
      id: 5,
      project_id: 5,
      project_name: 'Project 5',
      company_id: 5,
      company_name: 'Company 5',
      status: 'Active'
    }
  ];

  constructor(
    public dialog: MatDialog, 
    private toast: ToastService) { }

  ngOnInit(): void {
    this.getTimesheetConfigs();
  }

  getTimesheetConfigs() {
    this.dataSource = new MatTableDataSource(this.timesheet_data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openDialog(data: any = {}) {}

  remove(data: any) : void {}

}
