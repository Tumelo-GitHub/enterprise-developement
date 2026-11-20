import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgrammeService } from 'src/app/routes/administration/services/programme.service';

@Component({
  selector: 'app-programme-beneficiary-form-wrapper',
  templateUrl: './programme-beneficiary-form-wrapper.component.html',
  styleUrls: ['./programme-beneficiary-form-wrapper.component.scss']
})
export class ProgrammeBeneficiaryFormWrapperComponent implements OnInit {
  programmeId: number | null = null;
  beneficiaryId: number | null = null;
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
      this.programmeId = +params['programmeId'];
      const id = params['beneficiaryId'];
      this.isEditMode = id && id !== 'new';
      
      // Get appointment data from router state
      const navigation = this.router.getCurrentNavigation();
      const appointmentData = navigation?.extras?.state?.['appointmentData'] || history.state?.appointmentData;
      
      if (this.isEditMode) {
        this.beneficiaryId = +id;
        if (appointmentData) {
          // Use the data passed from the list
          this.data = { ...appointmentData, programme_id: this.programmeId };
          this.isLoading = false;
        } else {
          // Fallback if no data in state
          this.data = { id: this.beneficiaryId, programme_id: this.programmeId };
          this.isLoading = false;
        }
      } else {
        this.data = { programme_id: this.programmeId };
        this.isLoading = false;
      }
    });
  }

  private loadAppointmentData(): void {
    // This method is no longer needed but keeping for reference
    if (this.beneficiaryId) {
      this.isLoading = true;
      this.programmeService.getAppointmentById(this.beneficiaryId).subscribe({
        next: (response: any) => {
          if (response.data) {
            this.data = response.data;
          } else if (response.result) {
            this.data = response.result;
          } else {
            this.data = response;
          }
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading appointment:', error);
          // Fallback to just IDs if API fails
          this.data = { id: this.beneficiaryId, programme_id: this.programmeId };
          this.isLoading = false;
        }
      });
    }
  }

  goBackToProgrammes(): void {
    this.router.navigate(['/administration/programme']);
  }

  goBackToBeneficiaries(): void {
    this.router.navigate(['/administration/programme', this.programmeId, 'beneficiaries']);
  }

  onFormSubmitted(beneficiaryData: any): void {
    this.goBackToBeneficiaries();
  }

  onFormCancelled(): void {
    this.goBackToBeneficiaries();
  }
}
