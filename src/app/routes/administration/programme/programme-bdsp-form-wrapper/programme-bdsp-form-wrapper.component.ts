import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BdspAppointmentService } from 'src/app/routes/administration/services/bdsp-appointment.service';

@Component({
  selector: 'app-programme-bdsp-form-wrapper',
  templateUrl: './programme-bdsp-form-wrapper.component.html',
  styleUrls: ['./programme-bdsp-form-wrapper.component.scss']
})
export class ProgrammeBdspFormWrapperComponent implements OnInit {
  programmeId: number | null = null;
  bdspId: number | null = null;
  data: any = null;
  isEditMode = false;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bdspService: BdspAppointmentService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.programmeId = +params['programmeId'];
      const id = params['bdspId'];
      this.isEditMode = id && id !== 'new';
      
      // Get appointment data from router state
      const navigation = this.router.getCurrentNavigation();
      const appointmentData = navigation?.extras?.state?.['appointmentData'] || history.state?.appointmentData;
      
      if (this.isEditMode) {
        this.bdspId = +id;
        if (appointmentData) {
          // Use the data passed from the list
          this.data = { ...appointmentData, programme_id: this.programmeId };
          this.isLoading = false;
        } else {
          // Fallback if no data in state
          this.data = { id: this.bdspId, programme_id: this.programmeId };
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
    if (this.bdspId) {
      this.isLoading = true;
      this.bdspService.getAppointmentById(this.bdspId).subscribe({
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
          console.error('Error loading BDSP appointment:', error);
          // Fallback to just IDs if API fails
          this.data = { id: this.bdspId, programme_id: this.programmeId };
          this.isLoading = false;
        }
      });
    }
  }

  goBackToProgrammes(): void {
    this.router.navigate(['/administration/programme']);
  }

  goBackToBdsp(): void {
    this.router.navigate(['/administration/programme', this.programmeId, 'bdsp']);
  }

  onFormSubmitted(bdspData: any): void {
    this.goBackToBdsp();
  }

  onFormCancelled(): void {
    this.goBackToBdsp();
  }
}
