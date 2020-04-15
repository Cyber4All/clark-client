import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedObjectsComponent } from './featured-objects.component';

describe('FeaturedObjectsComponent', () => {
  let component: FeaturedObjectsComponent;
  let fixture: ComponentFixture<FeaturedObjectsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeaturedObjectsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeaturedObjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
