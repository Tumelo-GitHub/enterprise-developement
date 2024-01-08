import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceProviderDetailsFormComponent } from './service-provider-details-form.component';

describe('ServiceProviderDetailsFormComponent', () => {
  let component: ServiceProviderDetailsFormComponent;
  let fixture: ComponentFixture<ServiceProviderDetailsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceProviderDetailsFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceProviderDetailsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
