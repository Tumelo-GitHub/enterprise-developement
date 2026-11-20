import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SmmeService } from '../../services/smme.service';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';

@Component({
  selector: 'app-beneficiaries-detail',
  templateUrl: './beneficiaries-detail.component.html',
  styleUrls: ['./beneficiaries-detail.component.scss']
})
export class BeneficiariesDetailComponent implements OnInit {
  companyId: number = 0;
  companyData: any = null;
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
      const id = params['id'];
      
      // Check the URL directly if params are empty
      const urlSegments = this.route.snapshot.url;
      
      if (id === 'new' || (urlSegments.length > 0 && urlSegments[urlSegments.length - 1].path === 'new')) {
        this.isEditMode = false;
        this.companyData = null;
        this.isLoading = false;
      } else if (id && id !== 'new') {
        this.isEditMode = true;
        this.companyId = +id;
        this.loadCompanyData();
      } else {
        this.isEditMode = false;
        this.companyData = null;
        this.isLoading = false;
      }
    });
  }

  loadCompanyData(): void {
    this.isLoading = true;
    this.smmeService.getCompanyById(this.companyId).subscribe({
      next: (resp) => {
        this.companyData = resp.data;
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

  onFormSubmitted(result: any): void {
    if (result?.data) {
      this.notificationUtil.showSuccess(
        this.isEditMode ? 'Company updated successfully' : 'Company created successfully'
      );
      this.router.navigate(['/administration/beneficiaries']);
    }
  }

  onFormCancelled(): void {
    this.router.navigate(['/administration/beneficiaries']);
  }
}
