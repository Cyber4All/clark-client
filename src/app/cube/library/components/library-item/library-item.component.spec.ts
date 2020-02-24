import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryItemComponent } from './library-item.component';

describe('LibraryItemComponent', () => {
  let component: LibraryItemComponent;
  let fixture: ComponentFixture<LibraryItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
