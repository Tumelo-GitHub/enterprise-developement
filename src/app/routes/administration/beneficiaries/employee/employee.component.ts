import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements OnInit {
  displayedColumns: string[] = ['name', 'surname', 'position', 'role', 'cellNumber', 'email', 'company', 'action'];
  columnsToDisplay: string[] = this.displayedColumns;
  dataSource!: MatTableDataSource<any>;

  columns = new FormControl('');
  columnList = [
    [
      'name',
      'Name'
    ],
    [
      'surname',
      'Surname',
    ],
    [
      'postion',
      'Position',
    ],
    [
      'role',
      'Role',
    ],
    [
      'cellNumber',
      'Cell Number',
    ],
    [
      'email',
      'Email',
    ],
    [
      'company',
      'Company',
    ],
    [
      'action',
      'Action',
    ]
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
    this.getEmployeeList();
  }

  getEmployeeList() {
    const res = [
      {
        name: "Tumelo",
        surname: 'Mokognyana',
        postion: 'Junior',
        role: 'Sotfware Developer',
        cellNumber: '01234567889',
        email: 'tunelo@naswenda.com',
        company: 'Naswenda Business Consultants'
      }
    ];
    this.dataSource = new MatTableDataSource(res);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    // this._genericService.getCompanyList().subscribe({
    //   next: (res) => {
    //     console.log(res)
    //     this.dataSource = new MatTableDataSource(res);
    //     this.dataSource.sort = this.sort;
    //     this.dataSource.paginator = this.paginator;
    //   },
    //   error: (err) => {
    //     console.log(err)
    //   }
    // })
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
    
  }

}
