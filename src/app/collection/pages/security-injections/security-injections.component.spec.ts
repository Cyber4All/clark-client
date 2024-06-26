import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityInjectionsComponent } from './security-injections.component';

describe('SecurityInjectionsComponent', () => {
  let component: SecurityInjectionsComponent;
  let fixture: ComponentFixture<SecurityInjectionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [SecurityInjectionsComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecurityInjectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
