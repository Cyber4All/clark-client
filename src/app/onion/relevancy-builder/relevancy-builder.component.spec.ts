import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelevancyBuilderComponent } from './relevancy-builder.component';

describe('RelevancyBuilderComponent', () => {
  let component: RelevancyBuilderComponent;
  let fixture: ComponentFixture<RelevancyBuilderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [RelevancyBuilderComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelevancyBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
