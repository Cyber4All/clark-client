import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuidelinesComponent } from './guidelines.component';

describe('GuidelinesComponent', () => {
  let component: GuidelinesComponent;
  let fixture: ComponentFixture<GuidelinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GuidelinesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuidelinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
