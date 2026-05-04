import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureCardsComponent } from './feature-cards.component';

describe('FeatureCardsComponent', () => {
  let component: FeatureCardsComponent;
  let fixture: ComponentFixture<FeatureCardsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [FeatureCardsComponent],
    teardown: { destroyAfterEach: false }
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
