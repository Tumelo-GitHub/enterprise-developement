import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BdspComponent } from './bdsp.component';

describe('BdspComponent', () => {
  let component: BdspComponent;
  let fixture: ComponentFixture<BdspComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BdspComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BdspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
