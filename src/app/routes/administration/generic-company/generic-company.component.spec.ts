import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericCompanyComponent } from './generic-company.component';

describe('GenericCompanyComponent', () => {
  let component: GenericCompanyComponent;
  let fixture: ComponentFixture<GenericCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericCompanyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
