import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRelevancyPopupComponent } from './create-relevancy-popup.component';

describe('CreateRelevancyPopupComponent', () => {
  let component: CreateRelevancyPopupComponent;
  let fixture: ComponentFixture<CreateRelevancyPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateRelevancyPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateRelevancyPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
