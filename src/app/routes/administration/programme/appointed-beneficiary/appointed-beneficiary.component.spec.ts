import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointedBeneficiaryComponent } from './appointed-beneficiary.component';

describe('AppointedBeneficiaryComponent', () => {
  let component: AppointedBeneficiaryComponent;
  let fixture: ComponentFixture<AppointedBeneficiaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppointedBeneficiaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointedBeneficiaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
