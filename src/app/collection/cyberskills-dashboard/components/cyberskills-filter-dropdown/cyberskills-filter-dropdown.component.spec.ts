import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CyberskillsFilterDropdownComponent } from './cyberskills-filter-dropdown.component';

describe('CyberskillsFilterDropdownComponent', () => {
  let component: CyberskillsFilterDropdownComponent;
  let fixture: ComponentFixture<CyberskillsFilterDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CyberskillsFilterDropdownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CyberskillsFilterDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
