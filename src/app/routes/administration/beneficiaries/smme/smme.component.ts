import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastService } from 'src/app/shared/services/toast.service';
import { SmmeFormComponent } from './smme-form/smme-form.component';
import { SmmeService } from '../../services/smme.service';
import { TableUtil } from 'src/app/shared/utils/tableUtil';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';


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
      'Smme Name',
      'smme_name'
    ], 
    [
      'Trading Name',
      'trading_name'
    ], 
    [
      'Business Type',
      'business_type'
    ], 
    [
      'Products',
      'products'
    ], 
    [
      'Description',
      'description'
    ], 
    [
      'Physical Address',
      'street_address_1'
    ], 
    [
      'Postal Address',
      'postal_address'
    ], 
    [
      'Address Note',
      'address_note'
    ], 
    [
      'Contact Person',
      'contact_person'
    ], 
    [
      'Contact Person Position',
      'contact_person_position'
    ], 
    [
      'Tell Number',
      'tel_number'
    ], 
    [
      'Cell Number',
      'cel_number'
    ], 
    [
      'Email',
      'email'
    ], 
    [
      'Registration',
      'registration_number'
    ], 
    [
      'Turnover Range',
      'turnover_range'
    ], 
    [
      'Website',
      'web_address'
    ], 
    [
      'Tax NUmber',
      'tax_number'
    ], 
    [
      'BBBEE',
      'bbbee'
    ], 
    [
      'Full Time Emp',
      'full_time_emp'
    ], 
    [
      'Part Time Emp',
      'part_time_emp'
    ], 
    [
      'Casual Emp',
      'casual_emp'
    ], 
    [
      'Black Owned',
      'black_owned'
    ], 
    [
      'Woman Owned',
      'woman_owned'
    ], 
    [
      'Youth Owned',
      'youth_owned'
    ], 
    [
      'Disabled Owned',
      'disabled_owned'
    ], 
    [
      'Industry',
      'industry'
    ], 
    [
      'Business Years',
      'business_years'
    ], 
    [
      'Programme',
      'programme'
    ], 
    [
      'Location Type',
      'location_type'
    ], 
    [
      'Contact Origin',
      'contact_origin'
    ], 
    [
      'Registered',
      'registered'
    ], 
    [
      'Action',
      'action'
    ]
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(public dialog: MatDialog, private toast: ToastService, private smmeService: SmmeService, private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer) { 
      this.matIconRegistry.addSvgIcon(
        `excel`,
        this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/images/microsoft-excel-icon.svg")
      );
    }

  ngOnInit(): void {
    this.getCompanyList();
  }

  exportTable() {
    TableUtil.exportTableToExcel("ExampleMaterialTable", "Companies Beneficiaries");
  }

  removeColumn() {
    if (this.columnsToDisplay.length) {
      this.columnsToDisplay.pop();
    }
  }

  selectedToppings(columns: any) {
    this.columnsToDisplay = columns.value;
  }

  getCompanyList() {
    this.smmeService.getSmme().subscribe({
      next: (res) => {
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
