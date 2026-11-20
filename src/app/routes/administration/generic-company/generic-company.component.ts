import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {FormControl} from '@angular/forms';
import { GenericCompanyFormComponent } from './generic-company-form/generic-company-form.component';
import { ToastService } from 'src/app/shared/services/toast.service';
import { GenericCompanyService } from '../services/generic-company.service';
import { Subject, takeUntil } from 'rxjs';
import { TextUtil } from 'src/app/shared/utils/textUtil';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';

// Constants
const COMPANY_COLUMNS = [
  { key: 'company_name', label: 'Company Name' },
  { key: 'physical_address', label: 'Physical Address' },
  { key: 'postal_address', label: 'Postal Address' },
  { key: 'dept_name', label: 'Department Name' },
  { key: 'dept_address', label: 'Department Address' },
  { key: 'contact_name', label: 'Contact Name' },
  { key: 'contact_cell', label: 'Contact Cell' },
  { key: 'contact_email', label: 'Contact Email' },
  { key: 'action', label: 'Action' }
];

@Component({
  selector: 'app-generic-company',
  templateUrl: './generic-company.component.html',
  styleUrls: ['./generic-company.component.scss']
})
export class GenericCompanyComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = COMPANY_COLUMNS.map(col => col.key);
  columnsToDisplay: string[] = ['company_name', 'physical_address', 'dept_name', 'contact_name', 'contact_cell', 'action'];
  dataSource!: MatTableDataSource<any>;
  companies: any[] = [];

  // Form visibility and editing state
  showForm = false;
  isEditMode = false;
  editingCompany: any | null = null;
  loading = false;

  columns = new FormControl('');
  columnList = COMPANY_COLUMNS.map(col => [col.key, col.label]);

  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private _genericService: GenericCompanyService, 
    private toast: ToastService,
    private router: Router,
    private notificationUtil: NotificationUtil
  ) { }

  ngOnInit(): void {
    this.getCompanyList();
  }

  ngAfterViewInit(): void {
    // Ensure paginator and sort are connected after view init
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectedColumns(column: any) {
    this.columnsToDisplay = column.value;
  }

  getCompanyList() {
    this.loading = true;
    this._genericService.getCompanyList()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.companies = res.data;
          this.updateTable();
          this.loading = false;
        },
        error: (err) => {
          this.notificationUtil.showError('Error loading companies');
          console.error('Error loading companies:', err);
          this.loading = false;
        }
      })
  }

  toggleForm(company: any | null = null) {
    this.isEditMode = !!company;
    this.editingCompany = company;
    this.showForm = true;
  }

  hideForm() {
    this.showForm = false;
    this.isEditMode = false;
    this.editingCompany = null;
    // Reconnect paginator after form is hidden
    setTimeout(() => {
      if (this.dataSource && this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  onSaveCompany(companyData: any) {
    if (this.isEditMode && this.editingCompany) {
      this.updateCompany(companyData);
    } else {
      this.addCompany(companyData);
    }
  }

  private addCompany(companyData: any) {
    this._genericService.add(companyData).subscribe({
      next: (res) => {
        this.notificationUtil.showSuccess('Company added successfully');
        if (res.data) {
          this.companies.push(res.data);
          this.updateTable();
        }
        this.hideForm();
      },
      error: (err) => {
        this.notificationUtil.showError('Failed to add company');
        console.error('Error adding company:', err);
      }
    });
  }

  private updateCompany(companyData: any) {
    this._genericService.update(this.editingCompany!.id, companyData).subscribe({
      next: (res) => {
        this.notificationUtil.showSuccess('Company updated successfully');
        const index = this.companies.findIndex(c => c.id === this.editingCompany!.id);
        if (index >= 0 && res.data) {
          this.companies[index] = res.data;
          this.updateTable();
        }
        this.hideForm();
      },
      error: (err) => {
        this.notificationUtil.showError('Failed to update company');
        console.error('Error updating company:', err);
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

  applyFilterFromEvent(event: Event): void {
    this.applyFilter(event);
  }

  deleteCompany(id: number) {
    const index = this.companies.findIndex(company => company.id === id);
    const company = this.companies[index];
    
    this.toast.openConfirmBox('danger', 'Delete', `Are you sure you want to delete ${company.company_name}?`).subscribe(
      resp => {
        if (resp.success) {
          this._genericService.delete(id).subscribe({
            next: resp => {
              this.notificationUtil.showSuccess('Company successfully deleted');
              this.companies.splice(index, 1);
              this.updateTable();
            },
            error: err => {
              this.notificationUtil.showError('Error deleting company');
              console.error('Error deleting company:', err);
            }
          });
        }
      }
    );
  }

  private updateTable() {
    this.dataSource = new MatTableDataSource(this.companies);
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

  // Utility method for truncating text
  truncateText(text: string, maxLength: number): string {
    return TextUtil.truncateText(text, maxLength);
  }

}
