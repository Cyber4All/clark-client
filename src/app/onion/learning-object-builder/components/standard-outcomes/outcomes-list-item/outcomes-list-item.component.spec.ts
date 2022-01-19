import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutcomesListItemComponent } from './outcomes-list-item.component';

describe('OutcomesListItemComponent', () => {
  let component: OutcomesListItemComponent;
  let fixture: ComponentFixture<OutcomesListItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [OutcomesListItemComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutcomesListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
