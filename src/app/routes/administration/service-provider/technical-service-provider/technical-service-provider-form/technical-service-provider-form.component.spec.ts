import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicalServiceProviderFormComponent } from './technical-service-provider-form.component';

describe('TechnicalServiceProviderFormComponent', () => {
  let component: TechnicalServiceProviderFormComponent;
  let fixture: ComponentFixture<TechnicalServiceProviderFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TechnicalServiceProviderFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnicalServiceProviderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
