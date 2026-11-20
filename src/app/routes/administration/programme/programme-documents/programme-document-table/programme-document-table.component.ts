import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IProgrammeDocument, ProgrammeDocumentService } from '../../../services/programme-document.service';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';

@Component({
  selector: 'app-programme-document-table',
  templateUrl: './programme-document-table.component.html',
  styleUrls: ['./programme-document-table.component.scss']
})
export class ProgrammeDocumentTableComponent implements OnInit {
  @Input() programmeId!: number;
  @Output() editDocument = new EventEmitter<IProgrammeDocument>();
  @Output() addDocument = new EventEmitter<void>();
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'document_name',
    'category',
    'file_size',
    'uploaded_at',
    'actions'
  ];

  dataSource: MatTableDataSource<IProgrammeDocument> = new MatTableDataSource<IProgrammeDocument>([]);
  isLoading: boolean = false;
  searchText: string = '';

  constructor(
    private documentService: ProgrammeDocumentService,
    private notificationUtil: NotificationUtil
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.documentService.getDocumentsByProgramme(this.programmeId).subscribe({
      next: (response: any) => {
        const documents = response.data || response.result || [];
        this.dataSource = new MatTableDataSource(documents);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading documents:', error);
        this.notificationUtil.showError('Failed to load documents');
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    this.dataSource.filter = this.searchText.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyFilterFromEvent(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchText = filterValue;
    this.applyFilter();
  }

  onAddDocumentClick(): void {
    this.addDocument.emit();
  }

  clearSearch(): void {
    this.searchText = '';
    this.applyFilter();
  }

  onEdit(document: IProgrammeDocument): void {
    this.editDocument.emit(document);
  }

  onDownload(document: IProgrammeDocument): void {
    this.documentService.downloadDocument(document);
    this.notificationUtil.showSuccess('Document downloaded successfully');
  }

  onDelete(document: IProgrammeDocument): void {
    if (confirm(`Are you sure you want to delete "${document.document_name}"?`)) {
      if (document.id) {
        this.documentService.deleteDocument(document.id).subscribe({
          next: (response) => {
            this.notificationUtil.showSuccess(response.message || 'Document deleted successfully');
            this.loadDocuments();
          },
          error: (error) => {
            console.error('Error deleting document:', error);
            this.notificationUtil.showError(error.error?.message || 'Failed to delete document');
          }
        });
      }
    }
  }

  formatFileSize(bytes?: number): string {
    if (!bytes) return 'N/A';
    
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  getCategoryLabel(category: string): string {
    const categories: { [key: string]: string } = {
      'contract': 'Contract',
      'guideline': 'Guideline',
      'template': 'Template',
      'report': 'Report',
      'presentation': 'Presentation',
      'policy': 'Policy',
      'form': 'Form',
      'other': 'Other'
    };
    return categories[category] || category;
  }
}
