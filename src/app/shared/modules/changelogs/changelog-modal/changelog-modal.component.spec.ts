import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangelogModalComponent } from './changelog-modal.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LearningObject } from '@entity';

describe('ChangelogModalComponent', () => {
  let component: ChangelogModalComponent;
  let fixture: ComponentFixture<ChangelogModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    declarations: [ChangelogModalComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangelogModalComponent);
    component = fixture.componentInstance;
    component.learningObject = new LearningObject();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
