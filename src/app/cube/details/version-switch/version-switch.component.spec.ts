import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionSwitchComponent } from './version-switch.component';

describe('VersionSwitchComponent', () => {
  let component: VersionSwitchComponent;
  let fixture: ComponentFixture<VersionSwitchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VersionSwitchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
