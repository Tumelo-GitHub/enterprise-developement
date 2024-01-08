import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicalServiceProviderComponent } from './technical-service-provider.component';

describe('TechnicalServiceProviderComponent', () => {
  let component: TechnicalServiceProviderComponent;
  let fixture: ComponentFixture<TechnicalServiceProviderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TechnicalServiceProviderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnicalServiceProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
