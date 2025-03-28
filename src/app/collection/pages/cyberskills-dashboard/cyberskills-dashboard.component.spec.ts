import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CyberskillsDashboardComponent } from './cyberskills-dashboard.component';

describe('CyberskillsDashboardComponent', () => {
  let component: CyberskillsDashboardComponent;
  let fixture: ComponentFixture<CyberskillsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CyberskillsDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CyberskillsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
