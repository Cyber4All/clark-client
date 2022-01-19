import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutageCardComponent } from './outage-card.component';

describe('OutageCardComponent', () => {
  let component: OutageCardComponent;
  let fixture: ComponentFixture<OutageCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [OutageCardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutageCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
