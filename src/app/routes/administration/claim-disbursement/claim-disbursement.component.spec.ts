import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimDisbursementComponent } from './claim-disbursement.component';

describe('ClaimDisbursementComponent', () => {
  let component: ClaimDisbursementComponent;
  let fixture: ComponentFixture<ClaimDisbursementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClaimDisbursementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimDisbursementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
