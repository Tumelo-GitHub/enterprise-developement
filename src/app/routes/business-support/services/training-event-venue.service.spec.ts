import { TestBed } from '@angular/core/testing';

import { TrainingEventVenueService } from './training-event-venue.service';

describe('TrainingEventVenueService', () => {
  let service: TrainingEventVenueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainingEventVenueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
