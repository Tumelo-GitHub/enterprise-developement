import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastService } from 'src/app/shared/services/toast.service';
import { BdspService } from '../../services/bdsp.service';
import { BdspFormComponent } from './bdsp-form/bdsp-form.component';

@Component({
  selector: 'app-bdsp',
  templateUrl: './bdsp.component.html',
  styleUrls: ['./bdsp.component.scss']
})
export class BdspComponent implements OnInit {
  displayedColumns: string[] = ['bdsp_name', 'physical_address', 'postal_address', 'tell_number', 'cell_number', 'email', 'description', 'registration', 'tax_number', 'bbbee_level', 'products', 'action'];
  columnsToDisplay: string[] = ['bdsp_name', 'physical_address', 'postal_address', 'cell_number', 'email', 'description', 'products', 'action'];
  dataSource!: MatTableDataSource<any>;
  companyList: any[] = [];
  clickedRow: any = null;
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

  constructor(public dialog: MatDialog, private toast: ToastService, private bdspService: BdspService) { }

  ngOnInit(): void {
    this.getCompanyList();
  }

  removeColumn() {
    if (this.columnsToDisplay.length) {
      this.columnsToDisplay.pop();
    }
  }

  selectedColumns(columns: any) {
    this.columnsToDisplay = columns.value;
  }

  getCompanyList() {
    this.bdspService.getBdsp().subscribe({
      next: (resp) => {
        this.companyList = resp.data;
        this.dataSource = new MatTableDataSource(this.companyList);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  openDialog() {
    const dialogRef = this.dialog.open(BdspFormComponent, {
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
          this.bdspService.delete(id).subscribe({
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
    const dialogRef = this.dialog.open(BdspFormComponent, {
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
