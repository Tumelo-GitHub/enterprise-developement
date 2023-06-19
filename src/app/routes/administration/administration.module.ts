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
import { BusinessDevelopmemtComponent } from './business-developmemt/business-developmemt.component';
import { ServiceProviderComponent } from './service-provider/service-provider.component';


@NgModule({
  declarations: [
    CourseComponent,
    ProgrammeComponent,
    BeneficiariesComponent,
    SmmeComponent,
    ComplianceComponent,
    EmployeeComponent,
    GenericCompanyComponent,
    BusinessDevelopmemtComponent,
    ServiceProviderComponent
  ],
  imports: [
    SharedModule,
    AdministrationRoutingModule
  ]
})
export class AdministrationModule { }
