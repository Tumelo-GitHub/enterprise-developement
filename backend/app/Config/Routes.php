<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->add('api/register', 'API\User::register');
$routes->add('api/login', 'API\User::login');
$routes->add('api/logout', 'API\User::logout');
$routes->post('api/refresh-token', 'API\User::refreshToken');
$routes->post('api/forgot-password', 'API\User::forgotPassword');
$routes->post('api/reset-password', 'API\User::resetPassword');
$routes->post('api/change-password', 'API\User::changePassword');
$routes->post('api/user/update/(:num)', 'API\User::updateUser/$1');

$routes->group('api', ['namespace' => 'App\Controllers', 'filter' => 'auth'], static function ($routes) {
    // users
    $routes->get('users', 'API\User::getAllUsers');
    // menu
    $routes->get('menu', 'Menu::index');
    //Generic company
    $routes->get('generic-company', 'GenericCompany::index');
    $routes->post('generic-company', 'GenericCompany::create');
    $routes->post('generic-company/(:num)', 'GenericCompany::update/$1');
    $routes->delete('generic-company/(:num)', 'GenericCompany::delete/$1');
    // SMME
    $routes->resource('smme', ['controller' => 'Smme', 'except' => 'new,edit,update']);
    $routes->post('smme/(:num)', 'Smme::update/$1');
    // BDSP
    $routes->resource('bdsp', ['controller' => 'BusinessDevCompany', 'except' => 'new,edit,update']);
    $routes->post('bdsp/(:num)', 'BusinessDevCompany::update/$1');
    // SMME EMP
    $routes->get('smmeemp/(:num)', 'SmmeEmp::index/$1');
    $routes->get('smmeemp/(:num)', 'SmmeEmp::show/$1');
    $routes->resource('smmeemp', ['controller' => 'SmmeEmp', 'except' => 'index,new,edit,update']);
    $routes->post('smmeemp/(:num)', 'SmmeEmp::update/$1');
    // BDSP EMP
    $routes->get('bdspemp/(:num)', 'BdspEmp::index/$1');
    $routes->resource('bdspemp', ['controller' => 'BdspEmp', 'except' => 'index,new,edit,update']);
    $routes->post('bdspemp/(:num)', 'BdspEmp::update/$1');
    // COMPLIANCE
    $routes->get('compliance/(:num)', 'Compliance::index/$1');
    $routes->get('compliance/status', 'Compliance::getComplianceStatus');
    $routes->get('compliance/types', 'Compliance::getComplianceTypes');
    $routes->resource('compliance', ['controller' => 'Compliance', 'except' => 'index,new,edit,update']);
    $routes->post('compliance/(:num)', 'Compliance::update/$1');
    // DOCUMENTS
    $routes->get('api/document/(:num)', 'Document::display/$1');
    $routes->post('api/document', 'Document::create');
    // PROGRAMME
    // $routes->resource('programme', ['controller' => 'Programme', 'except' => 'new,edit,update']);
    $routes->get('programme', 'Programme::index');
    $routes->get('programme/(:num)', 'Programme::show/$1');
    $routes->post('programme', 'Programme::create');
    $routes->post('programme/(:num)', 'Programme::update/$1');
    $routes->delete('programme/(:num)', 'Programme::delete/$1');
    $routes->get('programme-types', 'Programme::getProgrammeTypes');
    // APPOINT SMME
    $routes->get('appoint/smme/(:num)', 'SmmeAppointment::index/$1');
    $routes->post('appoint/smme/(:num)', 'SmmeAppointment::update/$1');
    $routes->resource('appoint/smme', ['controller' => 'SmmeAppointment', 'except' => 'index,new,edit,update']);
    // $routes->post('programme/(:num)', 'Programme::update/$1');
    $routes->get('programme/course/(:num)', 'ProgrammeCourse::index/$1');
    $routes->post('programme/course', 'ProgrammeCourse::create');
    $routes->post('programme/course/(:num)', 'ProgrammeCourse::update/$1');
    $routes->delete('programme/course/(:num)', 'ProgrammeCourse::delete/$1');
    // Course
    $routes->get('course', 'Course::index');
    $routes->post('course', 'Course::create');
    $routes->post('course/(:num)', 'Course::update/$1');
    $routes->delete('course/(:num)', 'Course::delete/$1');
    // BDSP Appointment
    $routes->get('appoint/bdsp/(:num)', 'BdspAppointment::index/$1');
    $routes->post('appoint/bdsp', 'BdspAppointment::create');
    $routes->post('appoint/bdsp/(:num)', 'BdspAppointment::update/$1');
    $routes->delete('appoint/bdsp/(:num)', 'BdspAppointment::delete/$1');
    // SERVICE PROVIDER
    $routes->get('service-provider', 'ServiceProvider::index');
    $routes->get('service-provider/role/(:num)', 'ServiceProvider::getByRole/$1');
    $routes->post('service-provider', 'ServiceProvider::create');
    $routes->post('service-provider/(:num)', 'ServiceProvider::update/$1');
    $routes->delete('service-provider/(:num)', 'ServiceProvider::delete/$1');
    // OTHER SERVICE PROVIDER
    $routes->get('other-service-provider', 'MoreServiceProvider::index');
    $routes->get('other-service-provider/(:num)', 'MoreServiceProvider::show/$1');
    $routes->post('other-service-provider', 'MoreServiceProvider::create');
    $routes->post('other-service-provider/(:num)', 'MoreServiceProvider::update/$1');
    $routes->delete('other-service-provider/(:num)', 'MoreServiceProvider::delete/$1');
    // Backward-compatible alias used by current frontend route
    $routes->get('service-provider-more', 'MoreServiceProvider::index');
    $routes->get('service-provider-more/(:num)', 'MoreServiceProvider::show/$1');
    $routes->post('service-provider-more', 'MoreServiceProvider::create');
    $routes->post('service-provider-more/(:num)', 'MoreServiceProvider::update/$1');
    $routes->delete('service-provider-more/(:num)', 'MoreServiceProvider::delete/$1');
    // SERVICE PROVIDER FEEDBACK / RATINGS
    $routes->get('service-provider-rating/(:num)', 'ServiceProviderRating::index/$1');
    $routes->post('service-provider-rating', 'ServiceProviderRating::create');
    $routes->post('service-provider-rating/(:num)', 'ServiceProviderRating::update/$1');
    $routes->delete('service-provider-rating/(:num)', 'ServiceProviderRating::delete/$1');
    // TRAINING EVENT'
    $routes->get('training/event', 'TrainingEvent::index');
    $routes->get('training/event/(:num)', 'TrainingEvent::show/$1');
    $routes->get('training/venue', 'TrainingEvent::getTrainingVenue');
    $routes->post('training/event', 'TrainingEvent::create');
    $routes->post('training/event/(:num)', 'TrainingEvent::update/$1');
    $routes->delete('training/event/(:num)', 'TrainingEvent::delete/$1');
    // TRAINING VANUE
    $routes->get('training-venue', 'TrainingVenue::index');
    $routes->post('training-venue', 'TrainingVenue::create');
    $routes->post('training-venue/(:num)', 'TrainingVenue::update/$1');
    $routes->delete('training-venue/(:num)', 'TrainingVenue::delete/$1');
    // TRAINING ATTENDANCE
    $routes->get('training/register', 'TrainingEventRegister::index');
    $routes->post('training/register', 'TrainingEventRegister::create');
    $routes->post('training/register/(:num)', 'TrainingEventRegister::update/$1');
    $routes->post('training/register/autofill/(:num)', 'TrainingEvent::autofillRegister/$1');
    $routes->delete('training/register/(:num)', 'TrainingEventRegister::delete/$1');
    // INVITED SMME
    $routes->get('training/smme/(:num)', 'TrainingEvent::getSmmeByEventId/$1');
    $routes->get('training/event/(:num)/invitations', 'TrainingEvent::getEventInvitations/$1');
    $routes->get('training/event/(:num)/invitation-stats', 'TrainingEvent::getEventInvitationStats/$1');
    $routes->get('training/invitation/(:num)', 'TrainingEvent::getInvitationById/$1');
    $routes->post('training/invitation/(:num)/status', 'TrainingEvent::UpdateInvitationStatus/$1');
    $routes->post('training/invitation', 'TrainingEvent::inviteBeneficiary');
    $routes->post('training/invitation/(:num)', 'TrainingEvent::UpdateInvitationStatus/$1');
    $routes->post('training/invitation/remove', 'TrainingEvent::deleteInvitation');
    $routes->delete('training/invitation/(:num)', 'TrainingEvent::deleteSingleInvitation/$1');
    // Timesheet
    $routes->get('timesheet', 'Timesheet::index');
    $routes->get('timesheet/company-report', 'Timesheet::companyReport');
    $routes->get('timesheet/companies', 'Timesheet::getCompanies');
    $routes->get('timesheet/projects', 'Timesheet::getProjects');
    $routes->get('timesheet/activities', 'Timesheet::getActivities');
    $routes->get('timesheet/work-types', 'Timesheet::getWorkTypes');
    $routes->get('timesheet/companies/(:num)', 'Timesheet::getCompaniesByProjectId/$1');
    $routes->post('timesheet', 'Timesheet::create');
    $routes->post('timesheet/(:num)', 'Timesheet::update/$1');
    $routes->delete('timesheet/(:num)', 'Timesheet::delete/$1');
    // disbursement
    $routes->post('disbursement', 'TimesheetDisbursement::create');
    $routes->post('disbursement/(:num)', 'TimesheetDisbursement::update/$1');
    $routes->delete('disbursement/(:num)', 'TimesheetDisbursement::delete/$1');

    $routes->get('business-industry', 'Home::business_industries');
    $routes->get('banking', 'Home::banking_options');
    $routes->get('smme-programs', 'Home::smme_program_options');

    // programme documents
    $routes->get('programme-documents/programme/(:num)', 'ProgrammeDocument::index/$1');
    $routes->post('programme-documents', 'ProgrammeDocument::create');
});

// Timesheet setup: projects, companies and companies within projects. Admin only.
// 'admin' filter also validates the JWT, so it replaces 'auth' here.
$routes->group('api/timesheet-admin', ['namespace' => 'App\Controllers', 'filter' => 'admin'], static function ($routes) {
    $routes->get('statuses', 'TimesheetAdmin::statuses');

    $routes->get('projects', 'TimesheetAdmin::projects');
    $routes->post('projects', 'TimesheetAdmin::createProject');
    $routes->post('projects/(:num)', 'TimesheetAdmin::updateProject/$1');
    $routes->delete('projects/(:num)', 'TimesheetAdmin::deleteProject/$1');

    $routes->get('projects/(:num)/companies', 'TimesheetAdmin::projectCompanies/$1');
    $routes->post('projects/(:num)/companies', 'TimesheetAdmin::addProjectCompanies/$1');
    $routes->post('project-companies/(:num)', 'TimesheetAdmin::updateProjectCompany/$1');
    $routes->delete('project-companies/(:num)', 'TimesheetAdmin::deleteProjectCompany/$1');

    $routes->get('companies', 'TimesheetAdmin::companies');
    $routes->post('companies', 'TimesheetAdmin::createCompany');
    $routes->post('companies/(:num)', 'TimesheetAdmin::updateCompany/$1');
    $routes->delete('companies/(:num)', 'TimesheetAdmin::deleteCompany/$1');

    $routes->get('activities', 'TimesheetAdmin::activities');
    $routes->post('activities', 'TimesheetAdmin::createActivity');
    $routes->post('activities/(:num)', 'TimesheetAdmin::updateActivity/$1');
    $routes->delete('activities/(:num)', 'TimesheetAdmin::deleteActivity/$1');

    $routes->get('work-types', 'TimesheetAdmin::workTypes');
    $routes->post('work-types', 'TimesheetAdmin::createWorkType');
    $routes->post('work-types/(:num)', 'TimesheetAdmin::updateWorkType/$1');
    $routes->delete('work-types/(:num)', 'TimesheetAdmin::deleteWorkType/$1');
});