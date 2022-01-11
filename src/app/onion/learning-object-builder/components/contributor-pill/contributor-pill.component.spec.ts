import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContributorPillComponent } from './contributor-pill.component';

describe('ContributorPillComponent', () => {
  let component: ContributorPillComponent;
  let fixture: ComponentFixture<ContributorPillComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ContributorPillComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContributorPillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
