import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimDisbursementFormComponent } from './claim-disbursement-form.component';

describe('ClaimDisbursementFormComponent', () => {
  let component: ClaimDisbursementFormComponent;
  let fixture: ComponentFixture<ClaimDisbursementFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClaimDisbursementFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimDisbursementFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
