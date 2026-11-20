import { Component, EventEmitter, OnInit, AfterViewInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastService } from 'src/app/shared/services/toast.service';
import { SmmeService } from '../../services/smme.service';
import { TableUtil } from 'src/app/shared/utils/tableUtil';


@Component({
  selector: 'app-smme',
  templateUrl: './smme.component.html',
  styleUrls: ['./smme.component.scss']
})
export class SmmeComponent implements OnInit, AfterViewInit {
  // Default visible columns (can be customized by user)
  columnsToDisplay: string[] = ['smme_name', 'street_address_1', 'contact_person', 'cel_number', 'email', 'programme', 'location_type', 'action'];
  dataSource!: MatTableDataSource<any>;
  companyList: any[] = [];
  isLoading = false;
  searchTerm = '';
  @Output() showEmployees: EventEmitter<any> = new EventEmitter();
  @Output() showCompliance: EventEmitter<any> = new EventEmitter();
  @Output() showForm: EventEmitter<any> = new EventEmitter();
  @Output() editForm: EventEmitter<any> = new EventEmitter();

  columns = new FormControl('');
  
  // Column configuration: key is the column ID, value is the display label
  columnConfig: {[key: string]: string} = {
    'smme_name': 'Company Name',
    'trading_name': 'Trading Name',
    'business_type': 'Business Type',
    'products': 'Products',
    'description': 'Description',
    'street_address_1': 'Physical Address',
    'postal_address': 'Postal Address',
    'address_note': 'Address Note',
    'contact_person': 'Contact Person',
    'contact_person_position': 'Position',
    'tel_number': 'Tel Number',
    'cel_number': 'Cell Number',
    'email': 'Email',
    'registration_number': 'Registration',
    'turnover_range': 'Turnover Range',
    'web_address': 'Website',
    'tax_number': 'Tax Number',
    'bbbee': 'BBBEE Level',
    'full_time_emp': 'Full Time Employees',
    'part_time_emp': 'Part Time Employees',
    'casual_emp': 'Casual Employees',
    'black_owned': 'Black Owned',
    'woman_owned': 'Woman Owned',
    'youth_owned': 'Youth Owned',
    'disabled_owned': 'Disabled Owned',
    'industry': 'Industry',
    'business_years': 'Business Years',
    'programme': 'Programme',
    'location_type': 'Location Type',
    'contact_origin': 'Contact Origin',
    'registered': 'Registered',
    'action': 'Actions'
  };
  
  // Generate columnsList for the action bar component (initialized once)
  columnsList: string[][] = [];
  
  // Get all available column keys
  availableColumns: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(public dialog: MatDialog, private toast: ToastService, private smmeService: SmmeService) { 
      // Initialize columnsList and availableColumns from columnConfig
      this.columnsList = Object.entries(this.columnConfig).map(([key, label]) => [label, key]);
      this.availableColumns = Object.keys(this.columnConfig);
    }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.companyList);
    this.getCompanyList();
  }

  ngAfterViewInit(): void {
    // Initial connection after view init
    this.connectPaginationAndSort();
  }

  exportTable() {
    TableUtil.exportTableToExcel("ExampleMaterialTable", "Companies Beneficiaries");
  }

  exportTableToPDF() {
    TableUtil.exportTableToPDF("ExampleMaterialTable", "Companies Beneficiaries", "Company Beneficiaries", "l");
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
    this.isLoading = true;
    this.columns.disable(); // Disable the form control while loading
    this.smmeService.getSmme()?.subscribe(
      (res: any) => {
        if (res && res.data && res.data.length > 0) {
          this.companyList = res.data;
          this.dataSource = new MatTableDataSource(res.data);
        } else {
          this.companyList = [];
          this.dataSource = new MatTableDataSource([] as any[]);
        }
        // Connect paginator and sort after data is set using setTimeout
        this.connectPaginationAndSort();
        this.isLoading = false;
        this.columns.enable(); // Re-enable the form control after loading
      },
      (error: any) => {
        console.error('Error loading companies:', error);
        this.companyList = [];
        this.dataSource = new MatTableDataSource([] as any[]);
        // Connect paginator and sort even on error
        this.connectPaginationAndSort();
        this.isLoading = false;
        this.columns.enable(); // Re-enable the form control even on error
      }
    );
  }

  private connectPaginationAndSort() {
    setTimeout(() => {
      if (this.dataSource && this.paginator && this.sort) {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    }, 100);
  }

  openDialog() {
    this.showForm.emit(null); // Emit event to show form for new company
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchTerm = filterValue;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteCompany(id: number) {
    this.toast.openConfirmBox('danger', 'Delete', 'Are you sure you want to delete this company? <br> Removing this company will also remove all related employees and compliance records.').subscribe(
      resp => {
        if (resp.success) {
          this.smmeService.deleteCompany(id).subscribe({
            next: resp => {
              this.toast.toastNotification('success', 'Company successfully deleted', '');
              // Update local list instead of refetching
              this.removeCompanyFromList(id);
            },
            error: console.log
          })
        }
      }
    )
  }

  openEditForm(data: any) {
    this.editForm.emit(data); // Emit event to show form for editing company
  }

  viewEmployees(company: any) {
    this.showEmployees.emit(company);
  }

  viewCompliance(company: any) {
    this.showCompliance.emit(company);
  }

  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  // Methods to update local data without refetching
  addCompanyToList(newCompany: any): void {
    // Add new company to the beginning of the list
    this.companyList.unshift(newCompany);
    this.dataSource.data = [...this.companyList];
    this.connectPaginationAndSort();
  }

  updateCompanyInList(updatedCompany: any): void {
    // Find and update the existing company
    const index = this.companyList.findIndex(company => company.id === updatedCompany.id);
    if (index !== -1) {
      this.companyList[index] = updatedCompany;
      this.dataSource.data = [...this.companyList];
      this.connectPaginationAndSort();
    }
  }

  removeCompanyFromList(companyId: number): void {
    // Remove company from the list
    this.companyList = this.companyList.filter(company => company.id !== companyId);
    this.dataSource.data = [...this.companyList];
    this.connectPaginationAndSort();
  }

}
