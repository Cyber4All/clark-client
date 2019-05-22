import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericCollectionLogoComponent } from './generic-collection-logo.component';

describe('GenericCollectionLogoComponent', () => {
  let component: GenericCollectionLogoComponent;
  let fixture: ComponentFixture<GenericCollectionLogoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenericCollectionLogoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericCollectionLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
