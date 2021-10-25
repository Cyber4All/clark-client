import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureCardsComponent } from './feature-cards.component';

describe('FeatureCardsComponent', () => {
  let component: FeatureCardsComponent;
  let fixture: ComponentFixture<FeatureCardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeatureCardsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
