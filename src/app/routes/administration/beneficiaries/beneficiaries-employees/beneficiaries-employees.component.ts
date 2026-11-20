import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SmmeService } from '../../services/smme.service';
import { SmmeEmpService } from '../../services/smme-emp.service';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';
import { CompanyCacheService } from '../../services/company-cache.service';

@Component({
  selector: 'app-beneficiaries-employees',
  templateUrl: './beneficiaries-employees.component.html',
  styleUrls: ['./beneficiaries-employees.component.scss']
})
export class BeneficiariesEmployeesComponent implements OnInit {
  companyId: number = 0;
  company: any = null;
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private smmeService: SmmeService,
    public employeeService: SmmeEmpService,
    private notificationUtil: NotificationUtil,
    private companyCache: CompanyCacheService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.companyId = +params['companyId'];
      
      // Try to get company from cache first
      const cachedCompany = this.companyCache.getCompany(this.companyId);
      if (cachedCompany) {
        this.company = cachedCompany;
      } else {
        this.loadCompanyData();
      }
    });
  }

  loadCompanyData(): void {
    this.isLoading = true;
    this.smmeService.getCompanyById(this.companyId).subscribe({
      next: (resp) => {
        this.company = resp.data;
        this.companyCache.setCompany(this.companyId, resp.data);
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
    this.router.navigate(['/administration/beneficiaries', this.companyId, 'employees', 'new']);
  }

  onEditForm(data: any): void {
    this.router.navigate(['/administration/beneficiaries', this.companyId, 'employees', data.employee.id]);
  }
}
