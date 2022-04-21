import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAuthComponent } from './new-auth.component';

describe('NewAuthComponent', () => {
  let component: NewAuthComponent;
  let fixture: ComponentFixture<NewAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewAuthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
