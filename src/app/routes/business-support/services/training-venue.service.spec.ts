import { TestBed } from '@angular/core/testing';

import { TrainingVenueService } from './training-venue.service';

describe('TrainingVenueService', () => {
  let service: TrainingVenueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainingVenueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
