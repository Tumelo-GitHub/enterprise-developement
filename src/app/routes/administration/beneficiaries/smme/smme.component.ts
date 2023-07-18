import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastService } from 'src/app/shared/services/toast.service';
import { SmmeFormComponent } from './smme-form/smme-form.component';
import { SmmeService } from '../../services/smme.service';

@Component({
  selector: 'app-smme',
  templateUrl: './smme.component.html',
  styleUrls: ['./smme.component.scss']
})
export class SmmeComponent implements OnInit {
  displayedColumns: string[] = ['smme_name', 'trading_name', 'business_type', 'products', 'description', 'street_address_1', 'postal_address', 'address_note', 'contact_person', 'contact_person_position', 'tel_number', 'cel_number', 'email', 'registration_number', 'turnover_range', 'web_address', 'tax_number', 'bbbee', 'full_time_emp', 'part_time_emp', 'casual_emp', 'black_owned', 'woman_owned', 'youth_owned', 'disabled_owned', 'industry', 'business_years', 'programme', 'location_type', 'contact_origin', 'registered', 'action'];
  columnsToDisplay: string[] = ['smme_name', 'street_address_1', 'contact_person', 'cel_number', 'email', 'programme', 'location_type', 'action'];
  dataSource!: MatTableDataSource<any>;
  clickedRow = null;
  @Output() onCompanySelect: EventEmitter<any> = new EventEmitter();

  columns = new FormControl('');
  columnsList = [
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

  constructor(public dialog: MatDialog, private toast: ToastService, private smmeService: SmmeService) { }

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
    this.smmeService.getSmme().subscribe({
      next: (res) => {
        console.log(res)
        this.dataSource = new MatTableDataSource(res.companies);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        // this.toast.toastNotification('success', 'Success', res.message);
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  openDialog() {
    const dialogRef = this.dialog.open(SmmeFormComponent, {
      panelClass: 'form-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
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
    this.toast.openConfirmBox('danger', 'Delete', 'Are you sure you want to delete this company?').subscribe(
      resp => {
        if (resp.success) {
          this.smmeService.deleteCompany(id).subscribe({
            next: resp => {
              this.toast.toastNotification('success', 'Company successfully deleted', '');
              this.getCompanyList();
            },
            error: console.log
          })
        }
      }
    )
  }

  openEditForm(data: any) {
    const dialogRef = this.dialog.open(SmmeFormComponent, {
      data: data,
      panelClass: 'form-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getCompanyList();
      }
    });
  }

  getClickedRow(row: any) {
    this.clickedRow = row;
    this.onCompanySelect.emit(row);
  }

}
