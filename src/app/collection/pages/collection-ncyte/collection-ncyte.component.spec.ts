import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionNcyteComponent } from './collection-ncyte.component';

describe('CollectionNcyteComponent', () => {
  let component: CollectionNcyteComponent;
  let fixture: ComponentFixture<CollectionNcyteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectionNcyteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionNcyteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
