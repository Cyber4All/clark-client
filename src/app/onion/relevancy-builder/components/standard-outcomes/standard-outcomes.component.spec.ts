import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { StandardOutcomesComponent } from './standard-outcomes.component';

describe('StandardOutcomesComponent', () => {
  let component: StandardOutcomesComponent;
  let fixture: ComponentFixture<StandardOutcomesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [StandardOutcomesComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StandardOutcomesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
