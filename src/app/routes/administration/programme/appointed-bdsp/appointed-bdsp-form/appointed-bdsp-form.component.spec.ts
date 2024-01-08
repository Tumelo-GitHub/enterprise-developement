import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointedBdspFormComponent } from './appointed-bdsp-form.component';

describe('AppointedBdspFormComponent', () => {
  let component: AppointedBdspFormComponent;
  let fixture: ComponentFixture<AppointedBdspFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppointedBdspFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointedBdspFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
