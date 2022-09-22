import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionsDropdownComponent } from './collections-dropdown.component';

describe('CollectionsDropdownComponent', () => {
  let component: CollectionsDropdownComponent;
  let fixture: ComponentFixture<CollectionsDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollectionsDropdownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionsDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
