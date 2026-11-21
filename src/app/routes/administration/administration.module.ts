import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared';
import { AdministrationRoutingModule } from './administration-routing.module';

import { CourseComponent } from './course/course.component';
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
import { ProgrammeDocumentFormComponent } from './programme/programme-documents/programme-document-form/programme-document-form.component';
import { ProgrammeDocumentTableComponent } from './programme/programme-documents/programme-document-table/programme-document-table.component';
import { BeneficiariesComponent } from './beneficiaries/beneficiaries.component';
import { BeneficiariesListComponent } from './beneficiaries/beneficiaries-list/beneficiaries-list.component';
import { BeneficiariesPersonsComponent } from './beneficiaries/beneficiaries-persons/beneficiaries-persons.component';
import { BeneficiariesDetailComponent } from './beneficiaries/beneficiaries-detail/beneficiaries-detail.component';
import { BeneficiariesEmployeesComponent } from './beneficiaries/beneficiaries-employees/beneficiaries-employees.component';
import { BeneficiariesEmployeeFormComponent } from './beneficiaries/beneficiaries-employees/beneficiaries-employee-form/beneficiaries-employee-form.component';
import { BeneficiariesComplianceComponent } from './beneficiaries/beneficiaries-compliance/beneficiaries-compliance.component';
import { BeneficiariesComplianceFormComponent } from './beneficiaries/beneficiaries-compliance/beneficiaries-compliance-form/beneficiaries-compliance-form.component';
import { SmmeComponent } from './beneficiaries/smme/smme.component';
import { ComplianceComponent } from './beneficiaries/compliance/compliance.component';
import { GenericCompanyComponent } from './generic-company/generic-company.component';
import { GenericCompanyFormComponent } from './generic-company/generic-company-form/generic-company-form.component';
import { BusinessDevelopmemtComponent } from './business-developmemt/business-developmemt.component';
import { ServiceProviderComponent } from './service-provider/service-provider.component';
import { SmmeFormComponent } from './beneficiaries/smme/smme-form/smme-form.component';
import { BdspComponent } from './business-developmemt/bdsp/bdsp.component';
import { BdspFormComponent } from './business-developmemt/bdsp/bdsp-form/bdsp-form.component';
import { ComplianceFormComponent } from './beneficiaries/compliance/compliance-form/compliance-form.component';
import { ProgrammeTableComponent } from './programme/programme-table/programme-table.component';
import { ProgrammeFormComponent } from './programme/programme-table/programme-form/programme-form.component';
import { AppointedBeneficiaryComponent } from './programme/appointed-beneficiary/appointed-beneficiary.component';
import { AppointedBeneficiaryFormComponent } from './programme/appointed-beneficiary/appointed-beneficiary-form/appointed-beneficiary-form.component';
import { AppointedBdspComponent } from './programme/appointed-bdsp/appointed-bdsp.component';
import { AppointedBdspFormComponent } from './programme/appointed-bdsp/appointed-bdsp-form/appointed-bdsp-form.component';
import { ProgrammeCourseComponent } from './programme/programme-course/programme-course.component';
import { ProgrammeCourseFormComponent } from './programme/programme-course/programme-course-form/programme-course-form.component';
import { TimesheetComponent } from './timesheet/timesheet.component';
import { TimesheetFormComponent } from './timesheet/timesheet-form/timesheet-form.component';
import { CourseFormComponent } from './course/course-form/course-form.component';
import { PersonComponent } from './beneficiaries/person/person.component';
import { PersonFormComponent } from './beneficiaries/person/person-form/person-form.component';
import { TimesheetInvoiceComponent } from './timesheet/timesheet-invoice/timesheet-invoice.component';
import { ClaimDisbursementComponent } from './claim-disbursement/claim-disbursement.component';
import { ClaimDisbursementFormComponent } from './claim-disbursement/claim-disbursement-form/claim-disbursement-form.component';
import { TimesheetManagerComponent } from './timesheet-manager/timesheet-manager.component';
import { TimesheetNameDialogComponent } from './timesheet-manager/name-dialog/timesheet-name-dialog.component';
import { TimesheetAddCompaniesDialogComponent } from './timesheet-manager/add-companies-dialog/timesheet-add-companies-dialog.component';
import { TimesheetLookupPanelComponent } from './timesheet-manager/lookup-panel/timesheet-lookup-panel.component';
import { CompanyReportComponent } from './timesheet/company-report/company-report.component';
import { ServiceProviderFormComponent } from './service-provider/service-provider-form/service-provider-form.component';
import { ServiceProviderMoreComponent } from './service-provider-more/service-provider-more.component';
import { ServiceProviderMoreFormComponent } from './service-provider-more/service-provider-more-form/service-provider-more-form.component';
import { ServiceProviderRatingDialogComponent } from './service-provider-more/service-provider-rating-dialog/service-provider-rating-dialog.component';


@NgModule({
  declarations: [
    CourseComponent,
    ProgrammeComponent,
    ProgrammeListComponent,
    ProgrammeFormWrapperComponent,
    ProgrammeCoursesComponent,
    ProgrammeCourseFormWrapperComponent,
    ProgrammeBeneficiariesComponent,
    ProgrammeBeneficiaryFormWrapperComponent,
    ProgrammeBdspComponent,
    ProgrammeBdspFormWrapperComponent,
    ProgrammeDocumentsComponent,
    ProgrammeDocumentFormComponent,
    ProgrammeDocumentTableComponent,
    BeneficiariesComponent,
    BeneficiariesListComponent,
    BeneficiariesPersonsComponent,
    BeneficiariesDetailComponent,
    BeneficiariesEmployeesComponent,
    BeneficiariesEmployeeFormComponent,
    BeneficiariesComplianceComponent,
    BeneficiariesComplianceFormComponent,
    SmmeComponent,
    ComplianceComponent,
    GenericCompanyComponent,
    GenericCompanyFormComponent,
    BusinessDevelopmemtComponent,
    ServiceProviderComponent,
    SmmeFormComponent,
    BdspComponent,
    BdspFormComponent,
    ComplianceFormComponent,
    ProgrammeTableComponent,
    ProgrammeFormComponent,
    AppointedBeneficiaryComponent,
    AppointedBeneficiaryFormComponent,
    AppointedBdspComponent,
    AppointedBdspFormComponent,
    ProgrammeCourseComponent,
    ProgrammeCourseFormComponent,
    TimesheetComponent,
    TimesheetFormComponent,
    CourseFormComponent,
    PersonComponent,
    PersonFormComponent,
    TimesheetInvoiceComponent,
    ClaimDisbursementComponent,
    ClaimDisbursementFormComponent,
    TimesheetManagerComponent,
    TimesheetNameDialogComponent,
    TimesheetAddCompaniesDialogComponent,
    TimesheetLookupPanelComponent,
    CompanyReportComponent,
    ServiceProviderFormComponent,
    ServiceProviderMoreComponent,
    ServiceProviderMoreFormComponent,
    ServiceProviderRatingDialogComponent
  ],
  imports: [
    SharedModule,
    AdministrationRoutingModule
  ]
})
export class AdministrationModule { }
