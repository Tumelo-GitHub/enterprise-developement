import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ComplianceService } from '../../services/compliance.service';
import { ComplianceFormComponent } from './compliance-form/compliance-form.component';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ICompliance, IComplianceStatus, IComplianceType } from 'src/app/shared';
@Component({
  selector: 'app-compliance',
  templateUrl: './compliance.component.html',
  styleUrls: ['./compliance.component.scss']
})
export class ComplianceComponent implements OnInit {
  @Input() company_id: number = 0;
  displayedColumns: string[] = ['type_id', 'registration_num', 'issued_date', 'expiry_date', 'status', 'isVerified', 'verified_person', 'document', 'action'];
  columnsToDisplay: string[] = this.displayedColumns;
  dataSource!: MatTableDataSource<any>;
  statuses: IComplianceStatus[] = [];
  types: IComplianceType[] = [];
  compliances: ICompliance[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  blob: Blob | undefined;

  constructor(
    public dialog: MatDialog, 
    private complianceService: ComplianceService,
    private toast: ToastService
    ) { }

  ngOnInit(): void {
    this.complianceService.getStatus().subscribe(
      resp => this.statuses = resp.data
    );

    this.complianceService.getTypes().subscribe(
      resp => this.types = resp.data
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    this.getComplianceList(changes['company_id'].currentValue);
  }

  displayDocument(id: number, filename: string) {
    /*
     TODO: Refactor function to be reusable to other pages if possible
     make function flexible by not hardcoding type and filename
     */
    this.complianceService.displayDoc(id).subscribe(
      resp => {
        this.blob = new Blob([resp], {type: 'application/pdf'});

        var downloadURL = window.URL.createObjectURL(resp);
        var link = document.createElement('a');
        link.href = downloadURL;
        link.download = filename;
        link.click();
      }
    );
  }

  getComplianceList(id: number) {
    if (id !== 0) {
      this.complianceService.getComplienceListByCompany(id).subscribe({
        next: (res) => {
          this.compliances = res.data;
          this.dataSource = new MatTableDataSource(this.compliances);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        },
        error: (err) => {
          console.log(err)
        }
      })
    }
  }

  getStatusNameById(id: number) : string {
    for (let i = 0; i < this.statuses.length; i++) {
      if (this.statuses[i].id == id)
        return this.statuses[i].status_name;
    }

    return '';
  }

  getTypeNameById(id: number) : string {
    for (let i = 0; i < this.types.length; i++) {
      if (this.types[i].id == id)
        return this.types[i].type_name;
    }

    return '';
  }

  openDialog(data: any = {}) {
    var index = this.compliances.indexOf(data);
    data['company'] = this.company_id;

    let info = {
      'types': this.types,
      'statuses': this.statuses,
      'compliance': data
    };


    const dialogRef = this.dialog.open(ComplianceFormComponent, {
      data: info,
      panelClass: 'form-dialog'
    });
    dialogRef.afterClosed().subscribe((result: ICompliance) => {
      if (result) {
        if (index >= 0) {
          this.compliances[index] = result;
        } else {
          this.compliances.push(result);
        }
        this.dataSource = new MatTableDataSource(this.compliances); 
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

  deleteCompliance(compliance: ICompliance) {
    const index = this.compliances.indexOf(compliance);
    this.toast.openConfirmBox('danger', 'Delete', 'Are you sure you want to delete this?').subscribe(
      resp => {
        if (resp.success) {
          this.complianceService.delete(compliance.id).subscribe({
            next: resp => {
              this.toast.toastNotification('success', resp.message, '');
              // this.getComplianceList(this.company_id);
              this.compliances.splice(index, 1);
              this.dataSource = new MatTableDataSource(this.compliances);
            },
            error: console.log
          })
        }
      }
    );
  }

}
