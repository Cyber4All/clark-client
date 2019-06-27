import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangelogItemComponent } from './changelog-item.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ChangelogItemComponent', () => {
  let component: ChangelogItemComponent;
  let fixture: ComponentFixture<ChangelogItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ ChangelogItemComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangelogItemComponent);
    component = fixture.componentInstance;
    component.changelog = { author: {} };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
