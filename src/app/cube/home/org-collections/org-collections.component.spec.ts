import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgCollectionsComponent } from './org-collections.component';

describe('OrgCollectionsComponent', () => {
  let component: OrgCollectionsComponent;
  let fixture: ComponentFixture<OrgCollectionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgCollectionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgCollectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
