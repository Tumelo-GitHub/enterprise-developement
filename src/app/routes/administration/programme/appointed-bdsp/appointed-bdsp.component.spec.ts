import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointedBdspComponent } from './appointed-bdsp.component';

describe('AppointedBdspComponent', () => {
  let component: AppointedBdspComponent;
  let fixture: ComponentFixture<AppointedBdspComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppointedBdspComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointedBdspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
