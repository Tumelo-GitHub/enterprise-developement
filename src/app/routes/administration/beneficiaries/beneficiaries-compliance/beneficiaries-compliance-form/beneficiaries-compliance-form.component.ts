import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SmmeService } from '../../../services/smme.service';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';

@Component({
  selector: 'app-beneficiaries-compliance-form',
  templateUrl: './beneficiaries-compliance-form.component.html',
  styleUrls: ['./beneficiaries-compliance-form.component.scss']
})
export class BeneficiariesComplianceFormComponent implements OnInit {
  companyId: number = 0;
  complianceId: number | null = null;
  complianceData: any = null;
  company: any = null;
  types: any[] = [];
  statuses: any[] = [];
  isEditMode: boolean = false;
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private smmeService: SmmeService,
    private notificationUtil: NotificationUtil
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.companyId = +params['companyId'];
      const compId = params['complianceId'];
      
      // Get state data if available
      const state = history.state;
      this.types = state?.types || [];
      this.statuses = state?.statuses || [];
      
      if (compId === 'new') {
        this.isEditMode = false;
        this.complianceData = null;
        this.loadCompanyData();
      } else {
        this.isEditMode = true;
        this.complianceId = +compId;
        this.complianceData = state?.compliance || null;
        this.loadCompanyData();
      }
    });
  }

  loadCompanyData(): void {
    this.isLoading = true;
    this.smmeService.getCompanyById(this.companyId).subscribe({
      next: (resp) => {
        this.company = resp.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading company:', err);
        this.notificationUtil.showError('Failed to load company data');
        this.isLoading = false;
        this.goBack();
      }
    });
  }

  onFormSubmitted(result: any): void {
    if (result) {
      this.notificationUtil.showSuccess(
        this.isEditMode ? 'Compliance updated successfully' : 'Compliance created successfully'
      );
      this.goBack();
    }
  }

  onFormCancelled(): void {
    this.goBack();
  }

  goBack(): void {
    this.router.navigate(['/administration/beneficiaries', this.companyId, 'compliance']);
  }
}
