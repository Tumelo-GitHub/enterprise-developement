import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared';
import { AdministrationRoutingModule } from './administration-routing.module';

import { CourseComponent } from './course/course.component';
import { ProgrammeComponent } from './programme/programme.component';
import { BeneficiariesComponent } from './beneficiaries/beneficiaries.component';
import { SmmeComponent } from './beneficiaries/smme/smme.component';
import { ComplianceComponent } from './beneficiaries/compliance/compliance.component';
import { EmployeeComponent } from './beneficiaries/employee/employee.component';
import { GenericCompanyComponent } from './generic-company/generic-company.component';
import { GenericCompanyFormComponent } from './generic-company/generic-company-form/generic-company-form.component';
import { BusinessDevelopmemtComponent } from './business-developmemt/business-developmemt.component';
import { ServiceProviderComponent } from './service-provider/service-provider.component';
import { SmmeFormComponent } from './beneficiaries/smme/smme-form/smme-form.component';
import { BdspComponent } from './business-developmemt/bdsp/bdsp.component';
import { BdspEmployeeComponent } from './business-developmemt/bdsp-employee/bdsp-employee.component';
import { BdspFormComponent } from './business-developmemt/bdsp/bdsp-form/bdsp-form.component';
import { EmployeeFormComponent } from './beneficiaries/employee/employee-form/employee-form.component';
import { ComplianceFormComponent } from './beneficiaries/compliance/compliance-form/compliance-form.component';
import { BdspEmployeeFormComponent } from './business-developmemt/bdsp-employee/bdsp-employee-form/bdsp-employee-form.component';
import { ProgrammeTableComponent } from './programme/programme-table/programme-table.component';
import { ProgrammeFormComponent } from './programme/programme-table/programme-form/programme-form.component';
import { ServiceProviderDetailsComponent } from './service-provider/service-provider-details/service-provider-details.component';
import { TechnicalServiceProviderComponent } from './service-provider/technical-service-provider/technical-service-provider.component';
import { GeneralServiceProviderComponent } from './service-provider/general-service-provider/general-service-provider.component';
import { ServiceProviderDetailsFormComponent } from './service-provider/service-provider-details/service-provider-details-form/service-provider-details-form.component';
import { TechnicalServiceProviderFormComponent } from './service-provider/technical-service-provider/technical-service-provider-form/technical-service-provider-form.component';
import { AppointedBeneficiaryComponent } from './programme/appointed-beneficiary/appointed-beneficiary.component';
import { AppointedBeneficiaryFormComponent } from './programme/appointed-beneficiary/appointed-beneficiary-form/appointed-beneficiary-form.component';
import { AppointedBdspComponent } from './programme/appointed-bdsp/appointed-bdsp.component';
import { AppointedBdspFormComponent } from './programme/appointed-bdsp/appointed-bdsp-form/appointed-bdsp-form.component';
import { ProgrammeCourseComponent } from './programme/programme-course/programme-course.component';
import { ProgrammeCourseFormComponent } from './programme/programme-course/programme-course-form/programme-course-form.component';


@NgModule({
  declarations: [
    CourseComponent,
    ProgrammeComponent,
    BeneficiariesComponent,
    SmmeComponent,
    ComplianceComponent,
    EmployeeComponent,
    GenericCompanyComponent,
    GenericCompanyFormComponent,
    BusinessDevelopmemtComponent,
    ServiceProviderComponent,
    SmmeFormComponent,
    BdspComponent,
    BdspEmployeeComponent,
    BdspFormComponent,
    EmployeeFormComponent,
    ComplianceFormComponent,
    BdspEmployeeFormComponent,
    ProgrammeTableComponent,
    ProgrammeFormComponent,
    ServiceProviderDetailsComponent,
    TechnicalServiceProviderComponent,
    GeneralServiceProviderComponent,
    ServiceProviderDetailsFormComponent,
    TechnicalServiceProviderFormComponent,
    AppointedBeneficiaryComponent,
    AppointedBeneficiaryFormComponent,
    AppointedBdspComponent,
    AppointedBdspFormComponent,
    ProgrammeCourseComponent,
    ProgrammeCourseFormComponent
  ],
  imports: [
    SharedModule,
    AdministrationRoutingModule
  ]
})
export class AdministrationModule { }
