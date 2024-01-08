import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ServiceProviderDetailsFormComponent } from './service-provider-details-form/service-provider-details-form.component';
import { ServiceProviderService } from '../../services/service-provider.service';
import { SERVICE_TYPE } from 'src/app/shared/common/devwizarrd.constants';
import { IServiceProvider } from 'src/app/shared';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-service-provider-details',
  templateUrl: './service-provider-details.component.html',
  styleUrls: ['./service-provider-details.component.scss']
})
export class ServiceProviderDetailsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'email', 'tel_number', 'cell_number', 'qualification', 'specialization', 'service_type', 'action'];
  columnsToDisplay: string[] = this.displayedColumns;
  dataSource!: MatTableDataSource<IServiceProvider>;
  serviceProviderList: IServiceProvider[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public dialog: MatDialog,
    private serviceProviderService: ServiceProviderService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.getServiceProviderList();
  }

  getServiceProviderList () : void {
    this.serviceProviderService.getServiceProviderList().subscribe({
      next: reponse => {
        this.serviceProviderList = reponse.data;
        this.dataSource = new MatTableDataSource(this.serviceProviderList);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      error: console.log
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getServiceTypeById(id: number) : any {
    return SERVICE_TYPE.find(x => x.id == id)
  }

  openDialog(data?: IServiceProvider) {
    var index = (data) ? this.serviceProviderList.indexOf(data) : -1;

    const dialogRef = this.dialog.open(ServiceProviderDetailsFormComponent, {
      data: data,
      panelClass: 'form-dialog'
    });
    dialogRef.afterClosed().subscribe((result: IServiceProvider) => {
      if (result) {
        if (index >= 0) {
          this.serviceProviderList[index] = result;
        } else {
          this.serviceProviderList.push(result);
        }
        this.dataSource = new MatTableDataSource(this.serviceProviderList); 
      }
    });
  }

  deleteServiceProvider(data: any) {
    const index = this.serviceProviderList.indexOf(data);
    this.toast.openConfirmBox('danger', 'Delete', 'Are you sure you want to delete this?').subscribe(
      resp => {
        if (resp.success) {
          this.serviceProviderService.delete(data.id).subscribe({
            next: resp => {
              this.toast.toastNotification('success', resp.message, '');
              // this.getComplianceList(this.company_id);
              this.serviceProviderList.splice(index, 1);
              this.dataSource = new MatTableDataSource(this.serviceProviderList);
            },
            error: console.log
          })
        }
      }
    );
  }

}
