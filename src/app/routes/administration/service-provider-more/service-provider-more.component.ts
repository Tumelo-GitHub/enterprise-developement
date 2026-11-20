import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IMoreServiceProvider } from 'src/app/shared';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';
import { MoreServiceProviderService } from '../services/more-service-provider.service';
import { ServiceProviderRatingDialogComponent } from './service-provider-rating-dialog/service-provider-rating-dialog.component';

@Component({
  selector: 'app-service-provider-more',
  templateUrl: './service-provider-more.component.html',
  styleUrls: ['./service-provider-more.component.scss']
})
export class ServiceProviderMoreComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'name',
    'surname',
    'company_name',
    'city',
    'province',
    'tel_no',
    'cell_no',
    'email',
    'service_type',
    'comment',
    'rating',
    'actions'
  ];
  dataSource = new MatTableDataSource<IMoreServiceProvider>([]);
  providers: IMoreServiceProvider[] = [];
  loading = false;
  showForm = false;
  isEditMode = false;
  editingProvider: IMoreServiceProvider | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private service: MoreServiceProviderService,
    private notificationUtil: NotificationUtil,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProviders();
  }

  ngAfterViewInit(): void {
    this.attachTableFeatures();
  }

  loadProviders(): void {
    this.loading = true;
    this.service.getList().subscribe({
      next: (response) => {
        this.providers = response.data || [];
        this.dataSource.data = this.providers;
        this.attachTableFeatures();
        this.loading = false;
      },
      error: () => {
        this.notificationUtil.showError('Failed to load service providers');
        this.loading = false;
      }
    });
  }

  showAddForm(): void {
    this.editingProvider = null;
    this.isEditMode = false;
    this.showForm = true;
  }

  showEditForm(provider: IMoreServiceProvider): void {
    this.editingProvider = provider;
    this.isEditMode = true;
    this.showForm = true;
  }

  hideForm(): void {
    this.showForm = false;
    this.isEditMode = false;
    this.editingProvider = null;
    setTimeout(() => this.attachTableFeatures());
  }

  applyFilterFromEvent(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  private attachTableFeatures(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }

    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  onSave(data: Omit<IMoreServiceProvider, 'id'> | Partial<IMoreServiceProvider>): void {
    this.loading = true;

    const request = this.isEditMode && this.editingProvider
      ? this.service.update(this.editingProvider.id, data)
      : this.service.add(data as Omit<IMoreServiceProvider, 'id'>);

    request.subscribe({
      next: () => {
        this.notificationUtil.showSuccess(`Service provider ${this.isEditMode ? 'updated' : 'created'} successfully`);
        this.hideForm();
        this.loadProviders();
      },
      error: () => {
        this.notificationUtil.showError(`Failed to ${this.isEditMode ? 'update' : 'create'} service provider`);
        this.loading = false;
      }
    });
  }

  showFeedback(provider: IMoreServiceProvider): void {
    const dialogRef = this.dialog.open(ServiceProviderRatingDialogComponent, {
      data: { provider },
      width: '520px',
      panelClass: 'form-dialog'
    });

    dialogRef.afterClosed().subscribe(() => this.loadProviders());
  }

  onDelete(provider: IMoreServiceProvider): void {
    const confirmed = confirm(`Delete ${provider.name} ${provider.surname}?`);
    if (!confirmed) {
      return;
    }

    this.loading = true;
    this.service.delete(provider.id).subscribe({
      next: () => {
        this.notificationUtil.showSuccess('Service provider deleted successfully');
        this.loadProviders();
      },
      error: () => {
        this.notificationUtil.showError('Failed to delete service provider');
        this.loading = false;
      }
    });
  }
}
