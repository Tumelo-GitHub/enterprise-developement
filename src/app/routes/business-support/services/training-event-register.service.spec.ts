import { TestBed } from '@angular/core/testing';

import { TrainingEventRegisterService } from './training-event-register.service';

describe('TrainingEventRegisterService', () => {
  let service: TrainingEventRegisterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainingEventRegisterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
