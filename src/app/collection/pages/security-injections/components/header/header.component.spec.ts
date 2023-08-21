import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityInjectionsHeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: SecurityInjectionsHeaderComponent;
  let fixture: ComponentFixture<SecurityInjectionsHeaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [SecurityInjectionsHeaderComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecurityInjectionsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
