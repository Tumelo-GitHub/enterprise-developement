import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CourseComponent } from './course/course.component';
import { BeneficiariesComponent } from './beneficiaries/beneficiaries.component';
import { ProgrammeComponent } from './programme/programme.component';
import { GenericCompanyComponent } from './generic-company/generic-company.component';
import { BusinessDevelopmemtComponent } from './business-developmemt/business-developmemt.component';
import { ServiceProviderComponent } from './service-provider/service-provider.component';

const routes: Routes = [
  { path: 'course', component: CourseComponent },
  { path: 'beneficiaries', component: BeneficiariesComponent},
  { path: 'programme', component: ProgrammeComponent},
  { path: 'generic-company', component: GenericCompanyComponent},
  { path: 'business-development', component: BusinessDevelopmemtComponent},
  { path: 'service-provider', component: ServiceProviderComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministrationRoutingModule { }
