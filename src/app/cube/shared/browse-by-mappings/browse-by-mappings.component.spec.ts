import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseByMappingsComponent } from './browse-by-mappings.component';

describe('BrowseByMappingsComponent', () => {
  let component: BrowseByMappingsComponent;
  let fixture: ComponentFixture<BrowseByMappingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowseByMappingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseByMappingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
