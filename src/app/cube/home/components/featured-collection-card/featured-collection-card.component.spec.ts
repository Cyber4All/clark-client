import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedCollectionCardComponent } from './featured-collection-card.component';

describe('FeaturedCollectionCardComponent', () => {
  let component: FeaturedCollectionCardComponent;
  let fixture: ComponentFixture<FeaturedCollectionCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [FeaturedCollectionCardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeaturedCollectionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
