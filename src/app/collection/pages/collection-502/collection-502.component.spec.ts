import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { Collection502Component } from './collection-502.component';

describe('Collection502Component', () => {
  let component: Collection502Component;
  let fixture: ComponentFixture<Collection502Component>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [Collection502Component],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Collection502Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
