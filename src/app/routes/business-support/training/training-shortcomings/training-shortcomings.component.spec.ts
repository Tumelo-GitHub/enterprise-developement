import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingShortcomingsComponent } from './training-shortcomings.component';

describe('TrainingShortcomingsComponent', () => {
  let component: TrainingShortcomingsComponent;
  let fixture: ComponentFixture<TrainingShortcomingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainingShortcomingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingShortcomingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
