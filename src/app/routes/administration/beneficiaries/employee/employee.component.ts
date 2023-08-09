import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SmmeEmpService } from '../../services/smme-emp.service';
import { EmployeeFormComponent } from './employee-form/employee-form.component';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements OnInit {
  @Input() company_id: number = 0;
  displayedColumns: string[] = ['name', 'surname', 'position', 'role', 'cell_number', 'email', 'action'];
  columnsToDisplay: string[] = this.displayedColumns;
  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public dialog: MatDialog, 
    private empService: SmmeEmpService,
    private toast: ToastService
    ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    this.getEmployeeList(changes['company_id'].currentValue);
  }

  getEmployeeList(id: number) {
    if (id !== 0) {
      this.empService.getEmpByCompany(id).subscribe({
        next: (res) => {
          this.dataSource = new MatTableDataSource(res.employees);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        },
        error: (err) => {
          console.log(err)
        }
      })
    }
  }


  openDialog() {
    const dialogRef = this.dialog.open(EmployeeFormComponent, {
      data: {'company' : this.company_id},
      panelClass: 'form-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getEmployeeList(this.company_id);
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
              this.getEmployeeList(this.company_id);
            },
            error: console.log
          })
        }
      }
    )
  }

  openEditForm(data: any) {
    const dialogRef = this.dialog.open(EmployeeFormComponent, {
      data: data,
      panelClass: 'form-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getEmployeeList(this.company_id);
      }
    });
  }

}
