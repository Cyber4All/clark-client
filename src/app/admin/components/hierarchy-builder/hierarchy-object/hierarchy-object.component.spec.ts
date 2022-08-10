import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HierarchyObjectComponent } from './hierarchy-object.component';

describe('HierarchyObjectComponent', () => {
  let component: HierarchyObjectComponent;
  let fixture: ComponentFixture<HierarchyObjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HierarchyObjectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HierarchyObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
