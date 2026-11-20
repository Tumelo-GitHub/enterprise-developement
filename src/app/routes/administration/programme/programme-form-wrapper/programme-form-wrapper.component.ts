import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgrammeService } from 'src/app/routes/administration/services/programme.service';

@Component({
  selector: 'app-programme-form-wrapper',
  templateUrl: './programme-form-wrapper.component.html',
  styleUrls: ['./programme-form-wrapper.component.scss']
})
export class ProgrammeFormWrapperComponent implements OnInit {
  programmeId: number | null = null;
  data: any = null;
  isEditMode = false;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private programmeService: ProgrammeService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.isEditMode = id && id !== 'new';

      if (this.isEditMode) {
        this.programmeId = +id;
        this.loadProgrammeData();
      } else {
        // New programme
        this.data = {};
        this.isLoading = false;
      }
    });
  }

  private loadProgrammeData(): void {
    if (this.programmeId) {
      this.isLoading = true;
      this.programmeService.getProgrammeById(this.programmeId).subscribe({
        next: (response: any) => {
          if (response.successful && response.result) {
            this.data = response.result;
          } else if (response.data) {
            this.data = response.data;
          } else {
            this.data = response;
          }
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading programme:', error);
          this.data = { id: this.programmeId };
          this.isLoading = false;
        }
      });
    }
  }

  goBackToProgrammes(): void {
    this.router.navigate(['/administration/programme']);
  }

  onFormSubmitted(programmeData: any): void {
    this.goBackToProgrammes();
  }

  onFormCancelled(): void {
    this.goBackToProgrammes();
  }
}
