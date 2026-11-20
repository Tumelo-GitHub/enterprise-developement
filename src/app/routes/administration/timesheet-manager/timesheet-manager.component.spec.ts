import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from 'src/app/shared';

import { TimesheetManagerComponent } from './timesheet-manager.component';

describe('TimesheetManagerComponent', () => {
  let component: TimesheetManagerComponent;
  let fixture: ComponentFixture<TimesheetManagerComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, HttpClientTestingModule, NoopAnimationsModule],
      declarations: [ TimesheetManagerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetManagerComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  function flushInitialLoad() {
    http.expectOne('api/timesheet-admin/statuses').flush({ message: '', data: [{ id: 1, status: 'Active' }, { id: 2, status: 'Inactive' }] });
    http.expectOne('api/timesheet-admin/projects').flush({ message: '', data: [
      { id: 1, project_name: 'Alpha', company_count: 1, active_company_count: 1, entry_count: 3 }
    ] });
    http.expectOne('api/timesheet-admin/companies').flush({ message: '', data: [
      { id: 7, company_name: 'Acme', project_count: 1, project_names: 'Alpha', entry_count: 3 }
    ] });
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads setup data and selects the first project', () => {
    flushInitialLoad();
    http.expectOne('api/timesheet-admin/projects/1/companies').flush({ message: '', data: [
      { id: 11, project_id: 1, company_id: 7, company_name: 'Acme', status_id: 1, status: 'Active', entry_count: 3 }
    ] });

    expect(component.loading).toBeFalse();
    expect(component.selectedProject?.id).toBe(1);
    expect(component.projectCompanyData.data.length).toBe(1);
    expect(component.companyData.data.length).toBe(1);
    http.verify();
  });
});
