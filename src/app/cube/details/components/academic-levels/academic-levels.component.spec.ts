import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicLevelsComponent } from './academic-levels.component';

describe('AcademicLevelsComponent', () => {
  let component: AcademicLevelsComponent;
  let fixture: ComponentFixture<AcademicLevelsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AcademicLevelsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcademicLevelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
