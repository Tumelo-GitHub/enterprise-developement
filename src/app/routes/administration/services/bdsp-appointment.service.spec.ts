import { TestBed } from '@angular/core/testing';

import { BdspAppointmentService } from './bdsp-appointment.service';

describe('BdspAppointmentService', () => {
  let service: BdspAppointmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BdspAppointmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
