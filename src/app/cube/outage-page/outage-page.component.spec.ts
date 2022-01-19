import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutagePageComponent } from './outage-page.component';

describe('OutagePageComponent', () => {
  let component: OutagePageComponent;
  let fixture: ComponentFixture<OutagePageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [OutagePageComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutagePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
