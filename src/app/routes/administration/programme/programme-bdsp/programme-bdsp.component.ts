import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IProgramme } from 'src/app/shared';
import { ProgrammeService } from 'src/app/routes/administration/services/programme.service';

@Component({
  selector: 'app-programme-bdsp',
  templateUrl: './programme-bdsp.component.html',
  styleUrls: ['./programme-bdsp.component.scss']
})
export class ProgrammeBdspComponent implements OnInit {
  programme: IProgramme | null = null;
  programmeId: number | null = null;
  isLoading = true;

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
      this.isLoading = true;
      this.programmeService.getProgrammeById(this.programmeId).subscribe({
        next: (response: any) => {
          if (response.successful && response.result) {
            this.programme = response.result;
          } else if (response.data) {
            this.programme = response.data;
          }
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading programme:', error);
          this.isLoading = false;
        }
      });
    }
  }

  goBackToProgrammes(): void {
    this.router.navigate(['/administration/programme']);
  }

  showAddBdspForm(data: any): void {
    this.router.navigate(['/administration/programme', this.programmeId, 'bdsp', 'new']);
  }

  showEditBdspForm(data: any): void {
    const bdspId = data.bdsp?.id || data.id;
    // Pass the full appointment data through router state
    this.router.navigate(
      ['/administration/programme', this.programmeId, 'bdsp', bdspId],
      { state: { appointmentData: data.appointmentData || data.bdsp || data } }
    );
  }
}
