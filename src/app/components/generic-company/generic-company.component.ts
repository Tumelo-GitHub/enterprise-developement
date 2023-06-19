import { Component, OnInit, ViewChild } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { GenericCompanyService } from 'src/app/services/generic-company.service';
import {FormControl} from '@angular/forms';
import { GenericCompanyFormComponent } from './generic-company-form/generic-company-form.component';

@Component({
  selector: 'app-generic-company',
  templateUrl: './generic-company.component.html',
  styleUrls: ['./generic-company.component.scss']
})

export class GenericCompanyComponent implements OnInit {

  displayedColumns: string[] = ['companyName', 'physicalAddress', 'postalAddress', 'departmentName', 'departmentAddress', 'contactName', 'contactCell', 'contactEmail', 'action'];
  columnsToDisplay: string[] = ['companyName', 'physicalAddress', 'departmentName', 'contactName', 'contactCell', 'action'];
  dataSource!: MatTableDataSource<any>;

  toppings = new FormControl('');
  toppingList = [
    [
      'companyName',
      'Company Name'
    ],
    [
      'physicalAddress',
      'Physical Address',
    ],
    [
      'postalAddress',
      'Postal Address',
    ],
    [
      'departmentName',
      'Department Name',
    ],
    [
      'departmentAddress',
      'DepartmenAddress',
    ],
    [
      'contactName',
      'Contact Name',
    ],
    [
      'contactCell',
      'Contact Cell',
    ],
    [
      'contactEmail',
      'Contact Email',
    ],
    [
      'action',
      'Action',
    ]
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private _genericService: GenericCompanyService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.getCompanyList();
  }

  removeColumn() {
    if (this.columnsToDisplay.length) {
      this.columnsToDisplay.pop();
    }
  }

  selectedToppings(toppings: any) {
    this.columnsToDisplay = toppings.value;
  }

  getCompanyList() {
    this._genericService.getCompanyList().subscribe({
      next: (res) => {
        console.log(res)
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  openDialog() {
    const dialogRef = this.dialog.open(GenericCompanyFormComponent);
    console.log('closed')
    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if (result) {
        this.getCompanyList();
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

  deleteCompany(id: number) {
    this._genericService.deleteCompany(id).subscribe({
      next: resp => {
        alert("Company deleted");
        this.getCompanyList();
      },
      error: console.log
    })
  }

  openEditForm(companyData: any) {
    const dialogRef = this.dialog.open(GenericCompanyFormComponent, {
      data: companyData
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if (result) {
        this.getCompanyList();
      }
    });
  }

}
