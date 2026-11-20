import { Component, OnInit, ViewChild } from '@angular/core';
import { IBDSP } from 'src/app/shared';
import { BdspComponent } from './bdsp/bdsp.component';
import { BdspEmpService } from '../services/bdsp-emp.service';
import { CompanyEmployeeComponent } from 'src/app/shared/components/company-employee/company-employee.component';

type ViewType = 'companies' | 'employees' | 'add-employee' | 'edit-employee';

@Component({
  selector: 'app-business-developmemt',
  templateUrl: './business-developmemt.component.html',
  styleUrls: ['./business-developmemt.component.scss']
})
export class BusinessDevelopmemtComponent implements OnInit {
  @ViewChild(BdspComponent) bdspComponent!: BdspComponent;
  @ViewChild(CompanyEmployeeComponent) companyEmployeeComponent!: CompanyEmployeeComponent;
  
  // View management
  currentView: ViewType = 'companies';
  selectedCompany: IBDSP | null = null;
  
  // Form management
  showForm = false;
  isEditMode = false;
  editingCompany: IBDSP | null = null;
  
  // Employee form data
  employeeFormData: { employee?: any; companyId: number } | null = null;

  constructor(public employeeService: BdspEmpService) { }

  ngOnInit(): void {
  }

  // View navigation methods
  showCompanyEmployees(company: IBDSP): void {
    this.selectedCompany = company;
    this.currentView = 'employees';
  }

  goBackToCompanies(): void {
    this.currentView = 'companies';
    this.selectedCompany = null;
  }

  goBackToEmployees(): void {
    this.currentView = 'employees';
    this.employeeFormData = null;
  }

  // Employee form management methods
  showAddEmployeeForm(data: any): void {
    this.employeeFormData = {
      companyId: data.company_id
    };
    this.currentView = 'add-employee';
  }

  showEditEmployeeForm(data: any): void {
    this.employeeFormData = {
      employee: data.employee,
      companyId: data.company_id
    };
    this.currentView = 'edit-employee';
  }

  onEmployeeFormSubmitted(savedEmployee: any): void {
    if (this.companyEmployeeComponent) {
      if (this.currentView === 'edit-employee') {
        this.companyEmployeeComponent.updateEmployeeInList(savedEmployee);
      } else {
        this.companyEmployeeComponent.addEmployeeToList(savedEmployee);
      }
    }
    this.goBackToEmployees();
  }

  onEmployeeFormCancelled(): void {
    this.goBackToEmployees();
  }

  // Company form management methods
  toggleForm(companyData?: IBDSP) {
    if (companyData) {
      // Edit mode
      this.isEditMode = true;
      this.editingCompany = { ...companyData };
    } else {
      // Add mode
      this.isEditMode = false;
      this.editingCompany = null;
    }
    this.showForm = !this.showForm;
  }

  hideForm() {
    this.showForm = false;
    this.isEditMode = false;
    this.editingCompany = null;
  }

  editCompany(company: IBDSP) {
    this.toggleForm(company);
  }

  onSaveCompany(savedCompany: IBDSP) {
    // Form will handle the save and emit success
    this.hideForm();
    
    // Update the local list instead of refetching all data
    if (this.bdspComponent) {
      if (this.isEditMode) {
        // Update existing company in the list
        this.bdspComponent.updateCompanyInList(savedCompany);
      } else {
        // Add new company to the list
        this.bdspComponent.addCompanyToList(savedCompany);
      }
    }
  }
}
