import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessDevelopmemtComponent } from './business-developmemt.component';

describe('BusinessDevelopmemtComponent', () => {
  let component: BusinessDevelopmemtComponent;
  let fixture: ComponentFixture<BusinessDevelopmemtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessDevelopmemtComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessDevelopmemtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
