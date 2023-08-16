import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BdspEmployeeFormComponent } from './bdsp-employee-form.component';

describe('BdspEmployeeFormComponent', () => {
  let component: BdspEmployeeFormComponent;
  let fixture: ComponentFixture<BdspEmployeeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BdspEmployeeFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BdspEmployeeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
