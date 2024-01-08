import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgrammeCourseComponent } from './programme-course.component';

describe('ProgrammeCourseComponent', () => {
  let component: ProgrammeCourseComponent;
  let fixture: ComponentFixture<ProgrammeCourseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgrammeCourseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgrammeCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
