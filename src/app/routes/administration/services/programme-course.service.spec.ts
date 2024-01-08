import { TestBed } from '@angular/core/testing';

import { ProgrammeCourseService } from './programme-course.service';

describe('ProgrammeCourseService', () => {
  let service: ProgrammeCourseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProgrammeCourseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
