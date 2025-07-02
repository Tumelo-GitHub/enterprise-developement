import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetInvoiceComponent } from './timesheet-invoice.component';

describe('TimesheetInvoiceComponent', () => {
  let component: TimesheetInvoiceComponent;
  let fixture: ComponentFixture<TimesheetInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimesheetInvoiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
