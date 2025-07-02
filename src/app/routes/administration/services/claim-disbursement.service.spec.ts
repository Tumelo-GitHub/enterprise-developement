import { TestBed } from '@angular/core/testing';

import { ClaimDisbursementService } from './claim-disbursement.service';

describe('ClaimDisbursementService', () => {
  let service: ClaimDisbursementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClaimDisbursementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
