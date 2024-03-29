import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeAuthorComponent } from './change-author.component';

describe('ChangeAuthorComponent', () => {
  let component: ChangeAuthorComponent;
  let fixture: ComponentFixture<ChangeAuthorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [ChangeAuthorComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeAuthorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
