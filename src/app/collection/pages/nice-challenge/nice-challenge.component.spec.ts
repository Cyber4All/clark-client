import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NiceChallengeComponent } from './nice-challenge.component';

describe('NiceChallengeComponent', () => {
  let component: NiceChallengeComponent;
  let fixture: ComponentFixture<NiceChallengeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NiceChallengeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NiceChallengeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
