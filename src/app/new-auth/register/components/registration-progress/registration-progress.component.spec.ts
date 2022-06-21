import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationProgressComponent } from './registration-progress.component';

describe('RegistrationProgressComponent', () => {
  let component: RegistrationProgressComponent;
  let fixture: ComponentFixture<RegistrationProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistrationProgressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrationProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
