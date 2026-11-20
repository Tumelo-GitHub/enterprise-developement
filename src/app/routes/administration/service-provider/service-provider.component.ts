import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';
import { IServiceProvider } from 'src/app/shared';
import { ServiceProviderService } from '../services/service-provider.service';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';
import { TextUtil } from 'src/app/shared/utils/textUtil';
import { Router } from '@angular/router';

@Component({
  selector: 'app-service-provider',
  templateUrl: './service-provider.component.html',
  styleUrls: ['./service-provider.component.scss']
})
export class ServiceProviderComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  // Data management
  serviceProviders: IServiceProvider[] = [];
  dataSource = new MatTableDataSource<IServiceProvider>([]);
  loading = false;
  
  // UI state
  searchTerm = '';
  showForm = false;
  isEditMode = false;
  editingMentorship: IServiceProvider | null = null;
  
  // Table configuration
  displayedColumns: string[] = [
    'name', 'email', 'tel_number', 'qualification', 
    'specialization', 'service_types', 'actions'
  ];
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  totalItems = 0;
  
  private destroy$ = new Subject<void>();

  constructor(
    private serviceProviderService: ServiceProviderService,
    private dialog: MatDialog,
    private notificationUtil: NotificationUtil,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadServiceProviders();
    this.setupFilter();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Data operations
  loadServiceProviders(): void {
    this.loading = true;
    this.serviceProviderService.getServiceProviderList()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.serviceProviders = response.data;
          this.dataSource.data = this.serviceProviders;
          this.totalItems = this.serviceProviders.length;
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading service providers:', error);
          this.notificationUtil.showError('Error loading service providers');
          this.loading = false;
        }
      });
  }

  private setupFilter(): void {
    this.dataSource.filterPredicate = (data: IServiceProvider, filter: string) => {
      const searchTerms = filter.split(' ');
      return searchTerms.every(term =>
        data.name.toLowerCase().includes(term) ||
        data.surname.toLowerCase().includes(term) ||
        data.email.toLowerCase().includes(term) ||
        data.qualification.toLowerCase().includes(term) ||
        data.specialization.toLowerCase().includes(term) ||
        `${data.name} ${data.surname}`.toLowerCase().includes(term)
      );
    };
  }

  // Search and filter
  onSearch(): void {
    this.applyFilter();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter();
  }

  private applyFilter(): void {
    const filterValue = this.searchTerm.trim().toLowerCase();
    this.dataSource.filter = filterValue;
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Form management
  showAddForm(): void {
    this.editingMentorship = null;
    this.isEditMode = false;
    this.showForm = true;
  }

  showEditForm(serviceProvider: IServiceProvider): void {
    this.editingMentorship = serviceProvider;
    this.isEditMode = true;
    this.showForm = true;
  }

  hideForm(): void {
    this.showForm = false;
    this.editingMentorship = null;
    this.isEditMode = false;
  }

  onSaveMentorship(data: Omit<IServiceProvider, 'id'> | Partial<IServiceProvider>): void {
    this.loading = true;
    const operation$ = this.isEditMode && this.editingMentorship
      ? this.serviceProviderService.update(this.editingMentorship.id, data as Partial<IServiceProvider>)
      : this.serviceProviderService.add(data as Omit<IServiceProvider, 'id'>);

    operation$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        const action = this.isEditMode ? 'updated' : 'added';
        this.notificationUtil.showSuccess(`Service provider ${action} successfully`);
        this.loadServiceProviders();
        this.hideForm();
      },
      error: (error: any) => {
        const action = this.isEditMode ? 'updating' : 'adding';
        console.error(`Error ${action} service provider:`, error);
        this.notificationUtil.showError(`Error ${action} service provider`);
        this.loading = false;
      }
    });
  }

  deleteMentorship(serviceProvider: IServiceProvider): void {
    if (confirm(`Are you sure you want to delete ${serviceProvider.name} ${serviceProvider.surname}?`)) {
      this.loading = true;
      this.serviceProviderService.delete(serviceProvider.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.notificationUtil.showSuccess('Service provider deleted successfully');
            this.loadServiceProviders();
          },
          error: (error: any) => {
            console.error('Error deleting service provider:', error);
            this.notificationUtil.showError('Error deleting service provider');
            this.loading = false;
          }
        });
    }
  }

  // UI helpers
  getFullName(serviceProvider: IServiceProvider): string {
    return `${serviceProvider.name} ${serviceProvider.surname}`;
  }

  truncateText(text: string, maxLength: number = 50): string {
    return TextUtil.truncateText(text, maxLength);
  }

  // Check if service provider has a specific service type
  hasServiceType(serviceProvider: IServiceProvider, typeId: number | string): boolean {
    if (!serviceProvider.service_type || !Array.isArray(serviceProvider.service_type)) {
      return false;
    }
    const typeIdStr = String(typeId);
    return serviceProvider.service_type.some(type => String(type) === typeIdStr);
  }

  openMoreServiceProvidersPage(): void {
    this.router.navigate(['/administration/service-provider-more']);
  }
}
