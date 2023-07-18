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
    EmployeeFormComponent
  ],
  imports: [
    SharedModule,
    AdministrationRoutingModule
  ]
})
export class AdministrationModule { }
