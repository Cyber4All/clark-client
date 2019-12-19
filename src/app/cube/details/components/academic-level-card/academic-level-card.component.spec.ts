import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicLevelCardComponent } from './academic-level-card.component';

describe('AcademicLevelsComponent', () => {
  let component: AcademicLevelCardComponent;
  let fixture: ComponentFixture<AcademicLevelCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AcademicLevelCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcademicLevelCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
