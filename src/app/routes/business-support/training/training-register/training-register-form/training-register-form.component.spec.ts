import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingRegisterFormComponent } from './training-register-form.component';

describe('TrainingRegisterFormComponent', () => {
  let component: TrainingRegisterFormComponent;
  let fixture: ComponentFixture<TrainingRegisterFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainingRegisterFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingRegisterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
