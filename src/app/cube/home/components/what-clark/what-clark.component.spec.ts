import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatClarkComponent } from './what-clark.component';

describe('WhatClarkComponent', () => {
  let component: WhatClarkComponent;
  let fixture: ComponentFixture<WhatClarkComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [WhatClarkComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhatClarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
