import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { HierarchyLinkComponent } from './hierarchy-link.component';

describe('HierarchyLinkComponent', () => {
  let component: HierarchyLinkComponent;
  let fixture: ComponentFixture<HierarchyLinkComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HierarchyLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HierarchyLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
