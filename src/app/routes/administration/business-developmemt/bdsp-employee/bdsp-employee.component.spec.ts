import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BdspEmployeeComponent } from './bdsp-employee.component';

describe('BdspEmployeeComponent', () => {
  let component: BdspEmployeeComponent;
  let fixture: ComponentFixture<BdspEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BdspEmployeeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BdspEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
