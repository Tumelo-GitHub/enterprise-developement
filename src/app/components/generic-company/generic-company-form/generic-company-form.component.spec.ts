import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericCompanyFormComponent } from './generic-company-form.component';

describe('GenericCompanyFormComponent', () => {
  let component: GenericCompanyFormComponent;
  let fixture: ComponentFixture<GenericCompanyFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericCompanyFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericCompanyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
