import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmmeFormComponent } from './smme-form.component';

describe('SmmeFormComponent', () => {
  let component: SmmeFormComponent;
  let fixture: ComponentFixture<SmmeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmmeFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmmeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
