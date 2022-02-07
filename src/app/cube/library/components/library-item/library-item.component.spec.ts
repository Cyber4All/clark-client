import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryItemComponent } from './library-item.component';

describe('LibraryItemComponent', () => {
  let component: LibraryItemComponent;
  let fixture: ComponentFixture<LibraryItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [LibraryItemComponent],
    teardown: { destroyAfterEach: false }
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
