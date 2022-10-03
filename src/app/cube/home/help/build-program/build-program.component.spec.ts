import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildProgramComponent } from './build-program.component';

describe('BuildProgramComponent', () => {
  let component: BuildProgramComponent;
  let fixture: ComponentFixture<BuildProgramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuildProgramComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildProgramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
