import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagPillComponent } from './tag-pill.component';

describe('TagPillComponent', () => {
  let component: TagPillComponent;
  let fixture: ComponentFixture<TagPillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TagPillComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TagPillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
