import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { XPCyberComponent } from './xp-cyber.component';

describe('XPCyberComponent', () => {
  let component: XPCyberComponent;
  let fixture: ComponentFixture<XPCyberComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [XPCyberComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XPCyberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
