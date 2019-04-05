import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionsGridComponent } from './collections-grid.component';

describe('CollectionsGridComponent', () => {
  let component: CollectionsGridComponent;
  let fixture: ComponentFixture<CollectionsGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectionsGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
