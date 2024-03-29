import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionComponent } from './mission.component';

describe('MissionComponent', () => {
  let component: MissionComponent;
  let fixture: ComponentFixture<MissionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [MissionComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
