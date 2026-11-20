import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NotificationUtil } from '../../utils/notificationUtil';
import { IEmployee } from '../../interfaces';

@Component({
  selector: 'app-company-employee',
  templateUrl: './company-employee.component.html',
  styleUrls: ['./company-employee.component.scss']
})
export class CompanyEmployeeComponent implements OnInit, AfterViewInit {
  @Input() companyId: number = 0;
  @Input() employeeService: any; // Service to fetch employees
  @Output() showForm = new EventEmitter<any>();
  @Output() editForm = new EventEmitter<any>();
  
  displayedColumns: string[] = ['employee', 'role_info', 'contact', 'actions'];
  columnsToDisplay: string[] = this.displayedColumns;
  dataSource!: MatTableDataSource<any>;
  employeeList: IEmployee[] = [];
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private notification: NotificationUtil) { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.employeeList);
  }

  ngAfterViewInit(): void {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['companyId'] && changes['companyId'].currentValue) {
      this.getEmployeeList(changes['companyId'].currentValue);
    }
  }

  getEmployeeList(id: number) {
    if (id !== 0 && this.employeeService) {
      this.isLoading = true;
      this.employeeService.getEmpByCompany(id).subscribe({
        next: (resp: any) => {
          this.employeeList = resp.data || [];
          this.dataSource = new MatTableDataSource(this.employeeList);
          this.connectPaginationAndSort();
          this.isLoading = false;
        },
        error: (err: any) => {
          console.log(err);
          this.employeeList = [];
          this.dataSource = new MatTableDataSource([] as any[]);
          this.connectPaginationAndSort();
          this.isLoading = false;
        }
      })
    } else {
      this.employeeList = [];
      this.dataSource = new MatTableDataSource([] as any[]);
      this.connectPaginationAndSort();
      this.isLoading = false;
    }
  }

  private connectPaginationAndSort() {
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
    });
  }

  openEmployeeForm() {
    this.showForm.emit({
      company_id: this.companyId
    });
  }

  editEmployee(employee: any) {
    this.editForm.emit({
      employee: employee,
      company_id: this.companyId
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteEmp(employee: IEmployee) {
    const index = this.employeeList.indexOf(employee);
    const confirmed = confirm('Are you sure you want to delete this employee?');
    
    if (confirmed && this.employeeService) {
      this.employeeService.delete(employee.id).subscribe({
        next: (resp: any) => {
          this.notification.showSuccess(resp.message);
          this.employeeList.splice(index, 1);
          this.dataSource = new MatTableDataSource(this.employeeList);
          this.connectPaginationAndSort();
        },
        error: (err: any) => {
          this.notification.showError('Failed to delete employee');
          console.error(err);
        }
      });
    }
  }

  updateEmployeeInList(employee: any): void {
    const index = this.employeeList.findIndex(emp => emp.id === employee.id);
    if (index >= 0) {
      this.employeeList[index] = employee;
      this.dataSource = new MatTableDataSource(this.employeeList);
      this.connectPaginationAndSort();
    }
  }

  addEmployeeToList(employee: any): void {
    this.employeeList.push(employee);
    this.dataSource = new MatTableDataSource(this.employeeList);
    this.connectPaginationAndSort();
  }
}
