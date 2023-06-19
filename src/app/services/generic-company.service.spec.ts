import { TestBed } from '@angular/core/testing';

import { GenericCompanyService } from './generic-company.service';

describe('GenericCompanyService', () => {
  let service: GenericCompanyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenericCompanyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
