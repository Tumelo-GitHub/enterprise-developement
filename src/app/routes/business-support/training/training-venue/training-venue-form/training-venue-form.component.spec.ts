import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingVenueFormComponent } from './training-venue-form.component';

describe('TrainingVenueFormComponent', () => {
  let component: TrainingVenueFormComponent;
  let fixture: ComponentFixture<TrainingVenueFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainingVenueFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingVenueFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
