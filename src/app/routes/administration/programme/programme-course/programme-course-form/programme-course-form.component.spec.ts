import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgrammeCourseFormComponent } from './programme-course-form.component';

describe('ProgrammeCourseFormComponent', () => {
  let component: ProgrammeCourseFormComponent;
  let fixture: ComponentFixture<ProgrammeCourseFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgrammeCourseFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgrammeCourseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
