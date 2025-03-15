import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cyberskills2workfiltersComponent } from './cyberskills2workfilters.component';

describe('Cyberskills2workfiltersComponent', () => {
  let component: Cyberskills2workfiltersComponent;
  let fixture: ComponentFixture<Cyberskills2workfiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Cyberskills2workfiltersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Cyberskills2workfiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
