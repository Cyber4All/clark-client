import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeleporterDestinationComponent } from './teleporter-destination.component';

describe('TeleporterDestinationComponent', () => {
  let component: TeleporterDestinationComponent;
  let fixture: ComponentFixture<TeleporterDestinationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [TeleporterDestinationComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeleporterDestinationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
