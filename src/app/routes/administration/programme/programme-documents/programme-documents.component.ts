import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IProgramme } from 'src/app/shared';
import { ProgrammeService } from 'src/app/routes/administration/services/programme.service';
import { IProgrammeDocument } from '../../services/programme-document.service';
import { ProgrammeDocumentTableComponent } from './programme-document-table/programme-document-table.component';

@Component({
  selector: 'app-programme-documents',
  templateUrl: './programme-documents.component.html',
  styleUrls: ['./programme-documents.component.scss']
})
export class ProgrammeDocumentsComponent implements OnInit {
  @ViewChild(ProgrammeDocumentTableComponent) documentTable!: ProgrammeDocumentTableComponent;
  
  programme: IProgramme | null = null;
  programmeId: number | null = null;
  showForm: boolean = false;
  selectedDocument: IProgrammeDocument | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private programmeService: ProgrammeService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.programmeId = +params['programmeId'];
      if (this.programmeId) {
        this.loadProgramme();
      }
    });
  }

  private loadProgramme(): void {
    if (this.programmeId) {
      this.programmeService.getProgrammeById(this.programmeId).subscribe({
        next: (response: any) => {
          console.log('Programme data response:', response);
          // Handle both response.result and response.data patterns
          if (response.successful && response.result) {
            this.programme = response.result;
          } else if (response.data) {
            this.programme = response.data;
          } else if (response.result) {
            this.programme = response.result;
          }
          console.log('Programme loaded:', this.programme);
        },
        error: (error: any) => {
          console.error('Error loading programme:', error);
        }
      });
    }
  }

  goBackToProgrammes(): void {
    this.router.navigate(['/administration/programme']);
  }

  goBackToDocumentsList(): void {
    this.showForm = false;
    this.selectedDocument = null;
  }

  onAddDocument(): void {
    console.log('Add document clicked', { showForm: this.showForm, programme: this.programme });
    this.selectedDocument = null;
    this.showForm = true;
    console.log('After setting showForm', { showForm: this.showForm });
  }

  onEditDocument(document: IProgrammeDocument): void {
    this.selectedDocument = document;
    this.showForm = true;
  }

  onFormSubmitted(data: any): void {
    this.showForm = false;
    this.selectedDocument = null;
    if (this.documentTable) {
      this.documentTable.loadDocuments();
    }
  }

  onFormCancelled(): void {
    this.showForm = false;
    this.selectedDocument = null;
  }
}
