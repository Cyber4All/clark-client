import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRatingComponent } from './new-rating.component';

describe('NewRatingComponent', () => {
  let component: NewRatingComponent;
  let fixture: ComponentFixture<NewRatingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewRatingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
