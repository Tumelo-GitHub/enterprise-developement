import { Component, EventEmitter, OnInit, AfterViewInit, Output, ViewChild, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastService } from 'src/app/shared/services/toast.service';
import { BdspService } from '../../services/bdsp.service';
import { TableUtil } from 'src/app/shared/utils/tableUtil';
import { IBDSP } from 'src/app/shared';
import { TextUtil } from 'src/app/shared/utils/textUtil';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';

@Component({
  selector: 'app-bdsp',
  templateUrl: './bdsp.component.html',
  styleUrls: ['./bdsp.component.scss']
})
export class BdspComponent implements OnInit, AfterViewInit {
  columnsToDisplay: string[] = ['bdsp_name', 'physical_address', 'email', 'cell_number', 'bbbee_level', 'products', 'action'];
  dataSource!: MatTableDataSource<IBDSP>;
  companyList: IBDSP[] = [];
  clickedRow!: IBDSP;
  isLoading = false;
  searchTerm = '';
  
  @Input() showForm!: boolean;
  @Output() onCompanySelect: EventEmitter<any> = new EventEmitter();
  @Output() toggleForm: EventEmitter<IBDSP | undefined> = new EventEmitter();
  @Output() editCompany: EventEmitter<IBDSP> = new EventEmitter();
  @Output() showEmployees: EventEmitter<IBDSP> = new EventEmitter();

  columns = new FormControl('');
  columnConfig: {[key: string]: string} = {
    'bdsp_name': 'Company Name',
    'physical_address': 'Physical Address',
    'postal_address': 'Postal Address',
    'tell_number': 'Tel Number',
    'cell_number': 'Cell Number',
    'email': 'Email',
    'description': 'Description',
    'registration': 'Registration',
    'tax_number': 'Tax Number',
    'bbbee_level': 'BBBEE Level',
    'products': 'Products',
    'action': 'Action'
  };

  // Generate columnsList for the action bar component (initialized once)
  columnsList: string[][] = [];
  
  // Get all available column keys
  availableColumns: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public dialog: MatDialog, 
    private toast: ToastService,
    private notificationUtil: NotificationUtil,
    private bdspService: BdspService
  ) { 
    // Initialize columnsList and availableColumns from columnConfig
      this.columnsList = Object.entries(this.columnConfig).map(([key, label]) => [label, key]);
      this.availableColumns = Object.keys(this.columnConfig);
  }

  ngOnInit(): void {
    this.getCompanyList();
  }

  ngAfterViewInit(): void {
    // Set up pagination and sorting once after view init
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  truncateText(text: string, length: number): string {
    return TextUtil.truncateText(text, length);
  }

  exportTable() {
    TableUtil.exportTableToExcel("bdsp", "bdsp");
  }

  exportTableToPDF() {
    TableUtil.exportTableToPDF("bdsp", "BDSP_Companies", "Business Development Service Provider Companies", "l");
  }

  selectedColumns(columns: any) {
    this.columnsToDisplay = columns.value;
  }

  getCompanyList() {
    this.isLoading = true;
    this.bdspService.getBdsp().subscribe({
      next: (resp) => {
        this.companyList = resp.data;
        this.updateTable();
        this.isLoading = false;
      },
      error: (err) => {
        console.log(err);
        this.notificationUtil.showError('Failed to load companies');
        this.isLoading = false;
      }
    })
  }

  private updateTable() {
    this.dataSource = new MatTableDataSource(this.companyList);
    // Use setTimeout to ensure ViewChild elements are properly initialized
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
    });
  }

  addCompany() {
    this.toggleForm.emit();
  }

  editRow(data: IBDSP) {
    this.toggleForm.emit(data);
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
    this.toast.openConfirmBox('danger', 'Delete', 'Are you sure you want to delete this company?').subscribe(
      (resp: any) => {
        if (resp.success) {
          this.bdspService.delete(id).subscribe({
            next: (response) => {
              this.notificationUtil.showSuccess('Company successfully deleted');
              // Remove the deleted company from the current list instead of refetching
              this.companyList = this.companyList.filter(company => company.id !== id);
              this.dataSource.data = this.companyList;
            },
            error: (error) => {
              this.notificationUtil.showError('Failed to delete company');
              console.log(error);
            }
          })
        }
      }
    )
  }

  getClickedRow(row: IBDSP) {
    this.clickedRow = row;
    this.onCompanySelect.emit(row);
  }

  // Method to add a new company to the local list
  addCompanyToList(newCompany: IBDSP) {
    this.companyList.push(newCompany);
    this.dataSource.data = this.companyList;
  }

  // Method to update an existing company in the local list
  updateCompanyInList(updatedCompany: IBDSP) {
    const index = this.companyList.findIndex(company => company.id === updatedCompany.id);
    if (index !== -1) {
      this.companyList[index] = updatedCompany;
      this.dataSource.data = this.companyList;
    }
  }

  // Employee management methods
  navigateToEmployees(company: IBDSP): void {
    this.showEmployees.emit(company);
  }

  // Legacy method - now redirects to navigation
  toggleEmployees(company: IBDSP): void {
    this.navigateToEmployees(company);
  }
}
