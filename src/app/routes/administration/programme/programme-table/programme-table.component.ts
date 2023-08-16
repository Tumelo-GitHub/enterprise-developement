import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ProgrammeService } from '../../services/programme.service';
import { TableUtil } from 'src/app/shared/utils/tableUtil';
import { IProgramme } from 'src/app/shared';
import { ProgrammeFormComponent } from './programme-form/programme-form.component';

@Component({
  selector: 'app-programme-table',
  templateUrl: './programme-table.component.html',
  styleUrls: ['./programme-table.component.scss']
})
export class ProgrammeTableComponent implements OnInit {
  displayedColumns: string[] = ['programme_name', 'description', 'programme_type', 'generic_company_id', 'start_date', 'end_date', 'sponsor_name', 'sponsor_cell', 'sponsor_alt_cell', 'sponsor_email', 'action'];
  columnsToDisplay: string[] = ['programme_name', 'description', 'programme_type', 'generic_company_id', 'start_date', 'end_date', 'action'];
  dataSource!: MatTableDataSource<any>;
  programmeList: IProgramme[] = [];
  selectedRow?: IProgramme;

  columns = new FormControl('');
  columnsList = [
    [
      'Programme Name',
      'programme_name'
    ], 
    [
      'Description',
      'description'
    ], 
    [
      'Programme Type',
      'programme_type'
    ], 
    [
      'generic Company',
      'generic_company_id'
    ], 
    [
      'Start Date',
      'start_date'
    ], 
    [
      'End Date',
      'end_date'
    ], 
    [
      'Sponsor Name',
      'sponsor_name'
    ], 
    [
      'Sponsor Cell',
      'sponsor_cell'
    ], 
    [
      'Sponsor Alt Cell',
      'sponsor_alt_cell'
    ], 
    [
      'Sponsor Email',
      'sponsor_email'
    ], 
    [
      'Action',
      'action'
    ]
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public dialog: MatDialog, 
    private toast: ToastService, 
    private programmeService: ProgrammeService, 
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.getProgrammeList()
  }

  exportTable() {
    TableUtil.exportTableToExcel("ExampleMaterialTable", "Programmes");
  }

  removeColumn() {
    if (this.columnsToDisplay.length) {
      this.columnsToDisplay.pop();
    }
  }

  selectedColumns(columns: any) {
    this.columnsToDisplay = columns.value;
  }

  getProgrammeList() {
    this.programmeService.getProgrammes().subscribe({
      next: (resp) => {
        this.programmeList = resp.data
        this.dataSource = new MatTableDataSource(this.programmeList);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  openDialog(data: any = {}) {
    var index = this.programmeList.indexOf(data);

    const dialogRef = this.dialog.open(ProgrammeFormComponent, {
      data,
      panelClass: 'form-dialog'
    });
    dialogRef.afterClosed().subscribe((result: IProgramme) => {
      if (result) {
        if (index >= 0) {
          this.programmeList[index] = result;
        } else {
          this.programmeList.push(result);
        }
        this.dataSource = new MatTableDataSource(this.programmeList); 
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

  delete(programme: IProgramme) {
    const index = this.programmeList.indexOf(programme);
    this.toast.openConfirmBox('danger', 'Delete', 'Are you sure you want to delete this programme?').subscribe(
      resp => {
        if (resp.success) {
          this.programmeService.delete(programme.id).subscribe({
            next: resp => {
              this.toast.toastNotification('success', resp.message, '');
              this.programmeList.splice(index, 1);
            },
            error: console.log
          })
        }
      }
    )
  }

  getSelectedRow(row: any) {
    this.selectedRow = row;
    // this.onCompanySelect.emit(row);
  }
}
