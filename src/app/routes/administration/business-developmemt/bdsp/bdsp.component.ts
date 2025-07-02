import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastService } from 'src/app/shared/services/toast.service';
import { BdspService } from '../../services/bdsp.service';
import { BdspFormComponent } from './bdsp-form/bdsp-form.component';
import { TableUtil } from 'src/app/shared/utils/tableUtil';
import { IBDSP } from 'src/app/shared';

@Component({
  selector: 'app-bdsp',
  templateUrl: './bdsp.component.html',
  styleUrls: ['./bdsp.component.scss']
})
export class BdspComponent implements OnInit {
  displayedColumns: string[] = ['bdsp_name', 'physical_address', 'postal_address', 'tell_number', 'cell_number', 'email', 'description', 'registration', 'tax_number', 'bbbee_level', 'products', 'action'];
  columnsToDisplay: string[] = ['bdsp_name', 'physical_address', 'postal_address', 'cell_number', 'email', 'description', 'products', 'action'];
  dataSource!: MatTableDataSource<any>;
  companyList: IBDSP[] = [];
  clickedRow!: IBDSP;
  @Output() onCompanySelect: EventEmitter<any> = new EventEmitter();

  columns = new FormControl('');
  columnsList = [
    [
      'bdsp_name',
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
      'tell_number',
      'Tel Number',
    ],
    [
      'cell_number',
      'Cell Number',
    ],
    [
      'email',
      'Email',
    ],
    [
      'description',
      'Description',
    ],
    [
      'registration',
      'Registration',
    ],
    [
      'tax_number',
      'Tax Number',
    ],
    [
      'bbbee_level',
      'BBBEE Level',
    ],
    [
      'products',
      'Products',
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

  exportTable() {
    TableUtil.exportTableToExcel("bdsp", "bdsp");
  }

  exportTableToPDF() {
    // TableUtil.exportTableToPDF("bdsp", "bdsp", "Business Development Companies Information", "l");
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

  getClickedRow(row: IBDSP) {
    this.clickedRow = row;
    this.onCompanySelect.emit(row);
  }
}
