import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangelogModalComponent } from './changelog-modal.component';

describe('ChangelogModalComponent', () => {
  let component: ChangelogModalComponent;
  let fixture: ComponentFixture<ChangelogModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangelogModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangelogModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
