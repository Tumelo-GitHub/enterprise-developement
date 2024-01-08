import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingInvitedSmmeComponent } from './training-invited-smme.component';

describe('TrainingInvitedSmmeComponent', () => {
  let component: TrainingInvitedSmmeComponent;
  let fixture: ComponentFixture<TrainingInvitedSmmeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainingInvitedSmmeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingInvitedSmmeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
