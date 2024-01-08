import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralServiceProviderComponent } from './general-service-provider.component';

describe('GeneralServiceProviderComponent', () => {
  let component: GeneralServiceProviderComponent;
  let fixture: ComponentFixture<GeneralServiceProviderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralServiceProviderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralServiceProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
