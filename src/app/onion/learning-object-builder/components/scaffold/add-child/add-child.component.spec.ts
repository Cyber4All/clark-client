import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddChildComponent } from './add-child.component';

describe('AddChildComponent', () => {
  let component: AddChildComponent;
  let fixture: ComponentFixture<AddChildComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [AddChildComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
