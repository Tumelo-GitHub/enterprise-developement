import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastService } from 'src/app/shared/services/toast.service';
import { BdspEmpService } from '../../services/bdsp-emp.service';
import { BdspEmployeeFormComponent } from './bdsp-employee-form/bdsp-employee-form.component';

@Component({
  selector: 'app-bdsp-employee',
  templateUrl: './bdsp-employee.component.html',
  styleUrls: ['./bdsp-employee.component.scss']
})
export class BdspEmployeeComponent implements OnInit {
  @Input() bdsp_id!: number;
  displayedColumns: string[] = ['name', 'surname', 'position', 'role', 'cell_number', 'email', 'action'];
  columnsToDisplay: string[] = this.displayedColumns;
  dataSource!: MatTableDataSource<any>;
  employeeList: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public dialog: MatDialog, 
    private empService: BdspEmpService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    this.getEmployeeList(changes['bdsp_id'].currentValue);
  }

  getEmployeeList(id: number) {
    if (id) {
      this.empService.getEmpByCompany(id).subscribe({
        next: (res) => {
          this.employeeList = res.data;
          this.dataSource = new MatTableDataSource(this.employeeList);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        },
        error: (err) => {
          console.log(err)
        }
      })
    }
  }


  openDialog(data: any = {}) {
    var index = this.employeeList.indexOf(data);
    data['company'] = this.bdsp_id;

    const dialogRef = this.dialog.open(BdspEmployeeFormComponent, {
      data: data,
      panelClass: 'form-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (index >= 0) {
          this.employeeList[index] = result;
        } else {
          this.employeeList.push(result);
        }
        this.dataSource = new MatTableDataSource(this.employeeList); 
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

  deleteEmp(id: number) {
    this.toast.openConfirmBox('danger', 'Delete', 'Are you sure you want to delete this employee?').subscribe(
      resp => {
        if (resp.success) {
          this.empService.delete(id).subscribe({
            next: resp => {
              this.toast.toastNotification('success', resp.message, '');
              this.getEmployeeList(this.bdsp_id);
            },
            error: console.log
          })
        }
      }
    )
  }
}
