import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CubePatternComponent } from './cube-pattern.component';

describe('CubePatternComponent', () => {
  let component: CubePatternComponent;
  let fixture: ComponentFixture<CubePatternComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CubePatternComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CubePatternComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
