import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { PastIssueComponent } from './past-issue.component';

describe('PastIssueComponent', () => {
  let component: PastIssueComponent;
  let fixture: ComponentFixture<PastIssueComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PastIssueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PastIssueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
