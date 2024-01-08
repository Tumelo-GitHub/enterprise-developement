import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointedBeneficiaryFormComponent } from './appointed-beneficiary-form.component';

describe('AppointedBeneficiaryFormComponent', () => {
  let component: AppointedBeneficiaryFormComponent;
  let fixture: ComponentFixture<AppointedBeneficiaryFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppointedBeneficiaryFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointedBeneficiaryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
