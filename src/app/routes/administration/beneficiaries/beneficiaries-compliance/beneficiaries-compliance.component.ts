import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SmmeService } from '../../services/smme.service';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';

@Component({
  selector: 'app-beneficiaries-compliance',
  templateUrl: './beneficiaries-compliance.component.html',
  styleUrls: ['./beneficiaries-compliance.component.scss']
})
export class BeneficiariesComplianceComponent implements OnInit {
  companyId: number = 0;
  company: any = null;
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
      this.loadCompanyData();
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
        this.router.navigate(['/administration/beneficiaries']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/administration/beneficiaries']);
  }

  onShowForm(data: any): void {
    this.router.navigate(['/administration/beneficiaries', this.companyId, 'compliance', 'new'], {
      state: { types: data.types, statuses: data.statuses }
    });
  }

  onEditForm(data: any): void {
    this.router.navigate(['/administration/beneficiaries', this.companyId, 'compliance', data.compliance.id], {
      state: { types: data.types, statuses: data.statuses, compliance: data.compliance }
    });
  }
}
