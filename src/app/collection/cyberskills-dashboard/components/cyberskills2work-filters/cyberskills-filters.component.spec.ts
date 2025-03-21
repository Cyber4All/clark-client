import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CyberskillsFiltersComponent } from './cyberskills-filters.component';

describe('CyberskillsFiltersComponent', () => {
  let component: CyberskillsFiltersComponent;
  let fixture: ComponentFixture<CyberskillsFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CyberskillsFiltersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CyberskillsFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
