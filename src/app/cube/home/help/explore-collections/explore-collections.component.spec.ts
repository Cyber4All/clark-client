import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreCollectionsComponent } from './explore-collections.component';

describe('ExploreCollectionsComponent', () => {
  let component: ExploreCollectionsComponent;
  let fixture: ComponentFixture<ExploreCollectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExploreCollectionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreCollectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
