import { Component, OnInit, ViewChild } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {FormControl} from '@angular/forms';
import { GenericCompanyFormComponent } from './generic-company-form/generic-company-form.component';
import { ToastService } from 'src/app/shared/services/toast.service';
import { GenericCompanyService } from '../services/generic-company.service';

@Component({
  selector: 'app-generic-company',
  templateUrl: './generic-company.component.html',
  styleUrls: ['./generic-company.component.scss']
})

export class GenericCompanyComponent implements OnInit {

  displayedColumns: string[] = ['company_name', 'physical_address', 'postal_address', 'dept_name', 'dept_address', 'contact_name', 'contact_cell', 'contact_email', 'action'];
  columnsToDisplay: string[] = ['company_name', 'physical_address', 'dept_name', 'contact_name', 'contact_cell', 'action'];
  dataSource!: MatTableDataSource<any>;
  companies: any[] = [];

  toppings = new FormControl('');
  toppingList = [
    [
      'company_name',
      'Company Name'
    ],
    [
      'physical_address',
      'Physical Address',
    ],
    [
      'postal_address',
      'Postal Address',
    ],
    [
      'departmentName',
      'Department Name',
    ],
    [
      'dept_address',
      'DepartmenAddress',
    ],
    [
      'contact_name',
      'Contact Name',
    ],
    [
      'contact_cell',
      'Contact Cell',
    ],
    [
      'contact_email',
      'Contact Email',
    ],
    [
      'action',
      'Action',
    ]
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private _genericService: GenericCompanyService, 
    public dialog: MatDialog, 
    private toast: ToastService
    ) { }

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
        this.companies = res.data;
        this.updateDataTable();
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  openDialog(data: any = {}) {
    const index = this.companies.indexOf(data);

    const dialogRef = this.dialog.open(GenericCompanyFormComponent, {
      data,
      panelClass: 'form-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (index >= 0) {
          this.companies[index] = result;
        } else {
          this.companies.push(result);
        }
        this.updateDataTable();
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

  deleteCompany(row: any) {
    const index = this.companies.indexOf(row);

    this.toast.openConfirmBox('danger', 'Delete', 'Are you sure you want to delete this company?').subscribe(
      resp => {
        if (resp.success) {
          this._genericService.delete(row.id).subscribe({
            next: resp => {
              this.toast.toastNotification('success', 'Company successfully deleted', '');
              this.companies.splice(index, 1);
              this.updateDataTable();
            },
            error: console.log
          })
        }
      }
    )
  }

  private updateDataTable() {
    this.dataSource = new MatTableDataSource(this.companies);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

}
