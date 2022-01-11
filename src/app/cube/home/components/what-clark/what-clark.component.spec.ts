import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatClarkComponent } from './what-clark.component';

describe('WhatClarkComponent', () => {
  let component: WhatClarkComponent;
  let fixture: ComponentFixture<WhatClarkComponent>;

  beforeEach(waitForAsync () => {
    await TestBed.configureTestingModule({
      declarations: [ WhatClarkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WhatClarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
