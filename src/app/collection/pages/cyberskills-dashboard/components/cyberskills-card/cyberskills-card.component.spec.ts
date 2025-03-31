import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CyberskillsCardComponent } from './cyberskills-card.component';

describe('CyberskillsCardComponent', () => {
  let component: CyberskillsCardComponent;
  let fixture: ComponentFixture<CyberskillsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CyberskillsCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CyberskillsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
