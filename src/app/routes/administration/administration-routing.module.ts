import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CourseComponent } from './course/course.component';
import { BeneficiariesComponent } from './beneficiaries/beneficiaries.component';
import { BeneficiariesListComponent } from './beneficiaries/beneficiaries-list/beneficiaries-list.component';
import { BeneficiariesPersonsComponent } from './beneficiaries/beneficiaries-persons/beneficiaries-persons.component';
import { BeneficiariesDetailComponent } from './beneficiaries/beneficiaries-detail/beneficiaries-detail.component';
import { BeneficiariesEmployeesComponent } from './beneficiaries/beneficiaries-employees/beneficiaries-employees.component';
import { BeneficiariesEmployeeFormComponent } from './beneficiaries/beneficiaries-employees/beneficiaries-employee-form/beneficiaries-employee-form.component';
import { BeneficiariesComplianceComponent } from './beneficiaries/beneficiaries-compliance/beneficiaries-compliance.component';
import { BeneficiariesComplianceFormComponent } from './beneficiaries/beneficiaries-compliance/beneficiaries-compliance-form/beneficiaries-compliance-form.component';
import { ProgrammeComponent } from './programme/programme.component';
import { ProgrammeListComponent } from './programme/programme-list/programme-list.component';
import { ProgrammeFormWrapperComponent } from './programme/programme-form-wrapper/programme-form-wrapper.component';
import { ProgrammeCoursesComponent } from './programme/programme-courses/programme-courses.component';
import { ProgrammeCourseFormWrapperComponent } from './programme/programme-course-form-wrapper/programme-course-form-wrapper.component';
import { ProgrammeBeneficiariesComponent } from './programme/programme-beneficiaries/programme-beneficiaries.component';
import { ProgrammeBeneficiaryFormWrapperComponent } from './programme/programme-beneficiary-form-wrapper/programme-beneficiary-form-wrapper.component';
import { ProgrammeBdspComponent } from './programme/programme-bdsp/programme-bdsp.component';
import { ProgrammeBdspFormWrapperComponent } from './programme/programme-bdsp-form-wrapper/programme-bdsp-form-wrapper.component';
import { ProgrammeDocumentsComponent } from './programme/programme-documents/programme-documents.component';
import { GenericCompanyComponent } from './generic-company/generic-company.component';
import { BusinessDevelopmemtComponent } from './business-developmemt/business-developmemt.component';
import { ServiceProviderComponent } from './service-provider/service-provider.component';
import { ServiceProviderMoreComponent } from './service-provider-more/service-provider-more.component';
import { TimesheetComponent } from './timesheet/timesheet.component';
import { TimesheetManagerComponent } from './timesheet-manager/timesheet-manager.component';
import { UsersComponent } from './users/users.component';
import { AdminGuard, StaffGuard } from 'src/app/core';

const routes: Routes = [
  { path: 'timesheet', component: TimesheetComponent },
  { path: 'timesheet-manager', component: TimesheetManagerComponent, canActivate: [AdminGuard] },
  { path: 'users', component: UsersComponent, canActivate: [AdminGuard] },
  {
    // Everything else in Administration is off-limits to consultants
    path: '',
    canActivateChild: [StaffGuard],
    children: [
      { path: 'course', component: CourseComponent },
      {
        path: 'beneficiaries',
        component: BeneficiariesComponent,
        children: [
          { path: '', component: BeneficiariesListComponent },
          { path: 'persons', component: BeneficiariesPersonsComponent },
          { path: 'new', component: BeneficiariesDetailComponent },
          { path: ':companyId/employees/new', component: BeneficiariesEmployeeFormComponent },
          { path: ':companyId/employees/:employeeId', component: BeneficiariesEmployeeFormComponent },
          { path: ':companyId/employees', component: BeneficiariesEmployeesComponent },
          { path: ':companyId/compliance/new', component: BeneficiariesComplianceFormComponent },
          { path: ':companyId/compliance/:complianceId', component: BeneficiariesComplianceFormComponent },
          { path: ':companyId/compliance', component: BeneficiariesComplianceComponent },
          { path: ':id', component: BeneficiariesDetailComponent }
        ]
      },
      {
        path: 'programme',
        component: ProgrammeComponent,
        children: [
          { path: '', component: ProgrammeListComponent },
          { path: 'new', component: ProgrammeFormWrapperComponent },
          { path: ':id', component: ProgrammeFormWrapperComponent },
          { path: ':programmeId/courses', component: ProgrammeCoursesComponent },
          { path: ':programmeId/courses/new', component: ProgrammeCourseFormWrapperComponent },
          { path: ':programmeId/courses/:courseId', component: ProgrammeCourseFormWrapperComponent },
          { path: ':programmeId/beneficiaries', component: ProgrammeBeneficiariesComponent },
          { path: ':programmeId/beneficiaries/new', component: ProgrammeBeneficiaryFormWrapperComponent },
          { path: ':programmeId/beneficiaries/:beneficiaryId', component: ProgrammeBeneficiaryFormWrapperComponent },
          { path: ':programmeId/bdsp', component: ProgrammeBdspComponent },
          { path: ':programmeId/bdsp/new', component: ProgrammeBdspFormWrapperComponent },
          { path: ':programmeId/bdsp/:bdspId', component: ProgrammeBdspFormWrapperComponent },
          { path: ':programmeId/documents', component: ProgrammeDocumentsComponent }
        ]
      },
      { path: 'generic-company', component: GenericCompanyComponent},
      { path: 'business-development', component: BusinessDevelopmemtComponent},
      { path: 'service-provider', component: ServiceProviderComponent},
      { path: 'service-provider-more', component: ServiceProviderMoreComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministrationRoutingModule { }
