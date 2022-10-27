import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureCardsFiveotwoComponent } from './feature-cards-fiveotwo.component';

describe('FeatureCardsFiveotwoComponent', () => {
  let component: FeatureCardsFiveotwoComponent;
  let fixture: ComponentFixture<FeatureCardsFiveotwoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeatureCardsFiveotwoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureCardsFiveotwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
