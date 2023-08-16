import { TestBed } from '@angular/core/testing';

import { BdspEmpService } from './bdsp-emp.service';

describe('BdspEmpService', () => {
  let service: BdspEmpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BdspEmpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
