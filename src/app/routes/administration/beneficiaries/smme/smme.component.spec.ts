import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmmeComponent } from './smme.component';

describe('SmmeComponent', () => {
  let component: SmmeComponent;
  let fixture: ComponentFixture<SmmeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmmeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmmeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
