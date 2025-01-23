import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaggingBuilderComponent } from './tagging-builder.component';

describe('TaggingBuilderComponent', () => {
  let component: TaggingBuilderComponent;
  let fixture: ComponentFixture<TaggingBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaggingBuilderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaggingBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
