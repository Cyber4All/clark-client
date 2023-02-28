import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeachNowComponent } from './teach-now.component';

describe('TeachNowComponent', () => {
  let component: TeachNowComponent;
  let fixture: ComponentFixture<TeachNowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeachNowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeachNowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
