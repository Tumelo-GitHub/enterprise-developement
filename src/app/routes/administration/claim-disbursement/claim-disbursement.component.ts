import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ClaimDisbursementService } from '../services/claim-disbursement.service';
import { ClaimDisbursementFormComponent } from './claim-disbursement-form/claim-disbursement-form.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-claim-disbursement',
  templateUrl: './claim-disbursement.component.html',
  styleUrls: ['./claim-disbursement.component.scss']
})
export class ClaimDisbursementComponent implements OnInit {
  displayedColumns: string[] = ['date','item', 'units', 'price_per_unit', 'total', 'action'];
  columnsToDisplay: string[] = ['date','item', 'units', 'price_per_unit', 'total', 'action'];
  dataSource!: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  columnList = [];
  columns = new FormControl('');
  items: any[] = [];
  @Input() disbursementItems: any[] = [];

  constructor(private dialog: MatDialog, private _toastService: ToastService, private _disbursementService: ClaimDisbursementService) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    this.items = changes['disbursementItems'].currentValue;
    this.updateTable();
  }

  selectedColumns(column: any) {
    this.columnsToDisplay = column;
  }

  applyFilter(event: Event) {}

  deleteItem(id: number): void {
    const index = this.items.findIndex(t => t.id === id);

    this._toastService.openConfirmBox('danger', 'Delete', 'Are you sure you want to delete this item?').subscribe(
      resp => {
        if (resp.success) {
          this._disbursementService.delete(id).subscribe({
            next: resp => {
              this._toastService.toastNotification('success', 'Item successfully deleted', '');
              this.items.splice(index, 1);
              this.updateTable();
            },
            error: (err) => {
              console.error('Error deleting timesheet entry:', err);
              this._toastService.toastNotification('danger', 'Error', 'Failed to delete disbursement item.');
            }
          })
        }
      }
    )
  }

  openDialog(data: any = {}) {
    const index = this.items.indexOf(data);

    const dialogRef = this.dialog.open(ClaimDisbursementFormComponent, {
      data,
      panelClass: 'form-dialog'
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (index >= 0) {
          this.items[index] = result;
        } else {
          this.items.push(result);
        }
        this.updateTable();
      }
    });
  }

  getRowTotal(row: any): number {
    return row.units * row.price_per_unit;
  }

  updateTable(): void {
    this.dataSource = new MatTableDataSource(this.items);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort
  }

}
