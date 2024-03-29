import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterSectionComponent } from './filter-section.component';

describe('FilterSectionComponent', () => {
  let component: FilterSectionComponent;
  let fixture: ComponentFixture<FilterSectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [FilterSectionComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
