import { Component, OnInit, ViewChild } from '@angular/core';
import { TechnicalServiceProviderFormComponent } from './technical-service-provider-form/technical-service-provider-form.component';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-technical-service-provider',
  templateUrl: './technical-service-provider.component.html',
  styleUrls: ['./technical-service-provider.component.scss']
})
export class TechnicalServiceProviderComponent implements OnInit {
  displayedColumns: string[] = ['full_name', 'physical_address', 'postal_address', 'email', 'tel_number', 'cell_number', 'description', 'registration_num', 'tax_number', 'bbbee_level', 'products', 'action'];
  columnsToDisplay: string[] = this.displayedColumns;
  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openDialog(data: any = {}) {
    const dialogRef = this.dialog.open(TechnicalServiceProviderFormComponent, {
      data: data,
      panelClass: 'form-dialog'
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      // if (result) {
      //   if (index >= 0) {
      //     this.compliances[index] = result;
      //   } else {
      //     this.compliances.push(result);
      //   }
      //   this.dataSource = new MatTableDataSource(this.compliances); 
      // }
    });
  }

  deleteServiceProvider(data: any) {

  }

}
