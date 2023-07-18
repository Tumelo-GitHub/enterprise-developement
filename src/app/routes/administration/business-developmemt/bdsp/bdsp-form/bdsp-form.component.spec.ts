import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BdspFormComponent } from './bdsp-form.component';

describe('BdspFormComponent', () => {
  let component: BdspFormComponent;
  let fixture: ComponentFixture<BdspFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BdspFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BdspFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
