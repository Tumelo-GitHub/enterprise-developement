import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ComplianceService } from '../../services/compliance.service';

@Component({
  selector: 'app-compliance',
  templateUrl: './compliance.component.html',
  styleUrls: ['./compliance.component.scss']
})
export class ComplianceComponent implements OnInit {
  @Input() company_id: number = 0;
  displayedColumns: string[] = ['type_id', 'registration_num', 'issued_date', 'expiry_date', 'status', 'isVerified', 'verified_person', 'action'];
  columnsToDisplay: string[] = this.displayedColumns;
  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(public dialog: MatDialog, private complianceService: ComplianceService) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    this.getComplianceList(changes['company_id'].currentValue);
  }

  getComplianceList(id: number) {
    if (id !== 0) {
      this.complianceService.getComplienceListByCompany(id).subscribe({
        next: (res) => {
          console.log(res)
          this.dataSource = new MatTableDataSource(res.compliances);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        },
        error: (err) => {
          console.log(err)
        }
      })
    }
  }

  removeColumn() {
    // if (this.columnsToDisplay.length) {
    //   this.columnsToDisplay.pop();
    // }
  }

  selectedColumns(column: any) {
    // this.columnsToDisplay = column.value;
  }

  openDialog() {
    
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteCourse(id: number) {
    
  }

  openEditForm(data: any) {
    
  }

}
