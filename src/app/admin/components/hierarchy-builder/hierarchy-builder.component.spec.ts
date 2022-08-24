import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HierarchyBuilderComponent } from './hierarchy-builder.component';

describe('HierarchyBuilderComponent', () => {
  let component: HierarchyBuilderComponent;
  let fixture: ComponentFixture<HierarchyBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HierarchyBuilderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HierarchyBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
