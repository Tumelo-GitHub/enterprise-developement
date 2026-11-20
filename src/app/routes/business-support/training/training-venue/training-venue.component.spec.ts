import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingVenueComponent } from './training-venue.component';

describe('TrainingVenueComponent', () => {
  let component: TrainingVenueComponent;
  let fixture: ComponentFixture<TrainingVenueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainingVenueComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingVenueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
