import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SmmeEmpService } from '../../services/smme-emp.service';
import { EmployeeFormComponent } from './employee-form/employee-form.component';

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

  constructor(public dialog: MatDialog, private empService: SmmeEmpService) { }

  ngOnInit(): void {
    // this.getEmployeeList(this.company_id);
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

  removeColumn() {
    // if (this.columnsToDisplay.length) {
    //   this.columnsToDisplay.pop();
    // }
  }

  selectedColumns(column: any) {
    // this.columnsToDisplay = column.value;
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

  deleteCourse(id: number) {
    
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
