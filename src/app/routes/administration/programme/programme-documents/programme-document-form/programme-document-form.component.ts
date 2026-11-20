import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IProgramme } from 'src/app/shared';
import { IProgrammeDocument, ProgrammeDocumentService } from '../../../services/programme-document.service';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';

@Component({
  selector: 'app-programme-document-form',
  templateUrl: './programme-document-form.component.html',
  styleUrls: ['./programme-document-form.component.scss']
})
export class ProgrammeDocumentFormComponent implements OnInit {
  @Input() programme!: IProgramme;
  @Input() documentData: IProgrammeDocument | null = null;
  @Output() formSubmitted = new EventEmitter<any>();
  @Output() formCancelled = new EventEmitter<void>();

  documentForm!: FormGroup;
  selectedFile: File | null = null;
  selectedFileName: string = '';
  filePreview: string | null = null;
  isSubmitting: boolean = false;
  isEditMode: boolean = false;

  documentCategories = [
    { value: 'contract', label: 'Contract' },
    { value: 'guideline', label: 'Guideline' },
    { value: 'template', label: 'Template' },
    { value: 'report', label: 'Report' },
    { value: 'presentation', label: 'Presentation' },
    { value: 'policy', label: 'Policy' },
    { value: 'form', label: 'Form' },
    { value: 'other', label: 'Other' }
  ];

  acceptedFileTypes = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png';
  maxFileSize = 10; // MB

  constructor(
    private fb: FormBuilder,
    private documentService: ProgrammeDocumentService,
    private notificationUtil: NotificationUtil
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    
    if (this.documentData) {
      this.isEditMode = true;
      this.populateForm();
    }
  }

  private initializeForm(): void {
    this.documentForm = this.fb.group({
      document_name: ['', Validators.required],
      category: ['', Validators.required]
    });

    // File is required for new documents, optional for editing
    if (!this.isEditMode) {
      this.documentForm.addControl('file', this.fb.control(null, Validators.required));
    }
  }

  private populateForm(): void {
    if (this.documentData) {
      this.documentForm.patchValue({
        document_name: this.documentData.document_name,
        category: this.documentData.category
      });
      
      if (this.documentData.document_name) {
        this.selectedFileName = this.documentData.document_name;
      }
    }
  }

  onFileSelect(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      
      // Validate file size
      if (!this.documentService.validateFileSize(file)) {
        this.notificationUtil.showError(`File size must not exceed ${this.maxFileSize}MB`);
        event.target.value = '';
        return;
      }
      
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.documentForm.controls['file']?.setValue(file);

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.filePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.filePreview = null;
      }

      // Auto-populate document name if empty
      if (!this.documentForm.get('document_name')?.value) {
        const fileName = file.name.substring(0, file.name.lastIndexOf('.'));
        this.documentForm.patchValue({ document_name: fileName });
      }
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(files[0]);
        fileInput.files = dataTransfer.files;
        this.onFileSelect({ target: fileInput });
      }
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  removeFile(): void {
    this.selectedFile = null;
    this.selectedFileName = '';
    this.filePreview = null;
    this.documentForm.controls['file']?.setValue('');
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async onSubmit(): Promise<void> {
    if (this.documentForm.invalid) {
      this.documentForm.markAllAsTouched();
      return;
    }

    // For new documents, file is required
    if (!this.isEditMode && !this.selectedFile) {
      this.notificationUtil.showError('Please select a file to upload');
      return;
    }

    this.isSubmitting = true;

    try {
      let document_content = '';
      let document_type = '';
      let file_size = 0;
      let document_name = '';

      // Convert file to base64 if file is selected
      if (this.selectedFile) {
        document_content = await this.documentService.convertFileToBase64(this.selectedFile);
        document_type = this.selectedFile.type;
        file_size = this.documentService.calculateFileSize(document_content);
        document_name = this.selectedFile.name;
      } else if (this.documentData) {
        // Keep existing file data if editing without new file
        document_content = this.documentData.document_content;
        document_type = this.documentData.document_type;
        file_size = this.documentData.file_size || 0;
        document_name = this.documentData.document_name;
      }

      const documentPayload: IProgrammeDocument = {
        programme_id: this.programme.id,
        category: this.documentForm.value.category,
        document_name: document_name,
        document_type: document_type,
        document_content: document_content,
        file_size: file_size
      };

      if (this.isEditMode && this.documentData?.id) {
        this.documentService.updateDocument(this.documentData.id, documentPayload).subscribe({
          next: (response) => {
            this.notificationUtil.showSuccess(response.message || 'Document updated successfully');
            this.isSubmitting = false;
            this.formSubmitted.emit(response.data);
          },
          error: (error) => {
            this.notificationUtil.showError(error.error?.message || 'Failed to update document');
            this.isSubmitting = false;
          }
        });
      } else {
        this.documentService.uploadDocument(documentPayload).subscribe({
          next: (response) => {
            this.notificationUtil.showSuccess(response.message || 'Document uploaded successfully');
            this.isSubmitting = false;
            this.formSubmitted.emit(response.data);
          },
          error: (error) => {
            this.notificationUtil.showError(error.error?.message || 'Failed to upload document');
            this.isSubmitting = false;
          }
        });
      }
    } catch (error) {
      console.error('Error processing document:', error);
      this.notificationUtil.showError('Failed to process document');
      this.isSubmitting = false;
    }
  }

  onReset(): void {
    this.documentForm.reset();
    this.removeFile();
    if (this.isEditMode) {
      this.populateForm();
    }
  }

  onCancel(): void {
    this.formCancelled.emit();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
