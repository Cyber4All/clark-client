import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaItemComponent } from './media-item.component';

describe('MediaCardComponent', () => {
  let component: MediaItemComponent;
  let fixture: ComponentFixture<MediaItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MediaItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
