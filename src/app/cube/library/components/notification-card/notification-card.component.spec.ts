import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationCardComponent } from './notification-card.component';

describe('NotificationCardComponent', () => {
  let component: NotificationCardComponent;
  let fixture: ComponentFixture<NotificationCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [NotificationCardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
