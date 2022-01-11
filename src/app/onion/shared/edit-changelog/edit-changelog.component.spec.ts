import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditChangelogComponent } from './edit-changelog.component';

describe('EditChangelogComponent', () => {
  let component: EditChangelogComponent;
  let fixture: ComponentFixture<EditChangelogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditChangelogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditChangelogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
