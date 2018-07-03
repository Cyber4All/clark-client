import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingsFilterComponent } from './mappings-filter.component';

describe('MappingsFilterComponent', () => {
  let component: MappingsFilterComponent;
  let fixture: ComponentFixture<MappingsFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MappingsFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
