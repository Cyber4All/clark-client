import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangelogListComponent } from './changelog-list.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ChangelogListComponent', () => {
  let component: ChangelogListComponent;
  let fixture: ComponentFixture<ChangelogListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    declarations: [ChangelogListComponent],
    imports: [NoopAnimationsModule],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangelogListComponent);
    component = fixture.componentInstance;
    component.changelogs = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
