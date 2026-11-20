import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SmmeService } from '../../../services/smme.service';
import { SmmeEmpService } from '../../../services/smme-emp.service';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';
import { CompanyCacheService } from '../../../services/company-cache.service';

@Component({
  selector: 'app-beneficiaries-employee-form',
  templateUrl: './beneficiaries-employee-form.component.html',
  styleUrls: ['./beneficiaries-employee-form.component.scss']
})
export class BeneficiariesEmployeeFormComponent implements OnInit {
  companyId: number = 0;
  employeeId: number | null = null;
  employee: any = null;
  company: any = null;
  isEditMode: boolean = false;
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
      const empId = params['employeeId'];
      
      // Set edit mode BEFORE loading data
      // Check for 'new' string or undefined/null (add mode)
      if (!empId || empId === 'new') {
        this.isEditMode = false;
        this.employee = null;
        this.employeeId = null;
      } else {
        this.isEditMode = true;
        this.employeeId = +empId;
      }
      
      // Try to get company from cache first
      const cachedCompany = this.companyCache.getCompany(this.companyId);
      if (cachedCompany) {
        this.company = cachedCompany;
      } else {
        this.loadCompanyData();
      }
      
      // Load employee data if in edit mode
      if (this.isEditMode && this.employeeId) {
        this.loadEmployeeData();
      }
    });
  }

  loadCompanyData(): void {
    if (!this.isEditMode) {
      this.isLoading = true;
    }
    
    this.smmeService.getCompanyById(this.companyId).subscribe({
      next: (resp) => {
        this.company = resp.data;
        this.companyCache.setCompany(this.companyId, resp.data);
        if (!this.isEditMode) {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error loading company:', err);
        this.notificationUtil.showError('Failed to load company data');
        this.isLoading = false;
        this.goBack();
      }
    });
  }

  loadEmployeeData(): void {
    if (!this.employeeId) return;
    
    this.isLoading = true;
    this.employeeService.getEmployeeById(this.employeeId).subscribe({
      next: (resp) => {
        this.employee = resp.data;
        
        if (!this.employee) {
          this.notificationUtil.showError('Employee not found');
          this.goBack();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading employee:', err);
        this.notificationUtil.showError('Failed to load employee data');
        this.isLoading = false;
        this.goBack();
      }
    });
  }

  onFormSubmit(savedEmployee: any): void {
    this.notificationUtil.showSuccess(
      this.isEditMode ? 'Employee updated successfully' : 'Employee created successfully'
    );
    this.goBack();
  }

  onFormCancel(): void {
    this.goBack();
  }

  goBack(): void {
    this.router.navigate(['/administration/beneficiaries', this.companyId, 'employees']);
  }
}
