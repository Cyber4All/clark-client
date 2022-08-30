import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpBackBtnComponent } from './help-back-btn.component';

describe('HelpBackBtnComponent', () => {
  let component: HelpBackBtnComponent;
  let fixture: ComponentFixture<HelpBackBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HelpBackBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpBackBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
