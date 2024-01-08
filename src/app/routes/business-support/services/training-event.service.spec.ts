import { TestBed } from '@angular/core/testing';

import { TrainingEventService } from './training-event.service';

describe('TrainingEventService', () => {
  let service: TrainingEventService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainingEventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
