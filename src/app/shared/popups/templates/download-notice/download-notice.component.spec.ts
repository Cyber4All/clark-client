import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadNoticeComponent } from './download-notice.component';

describe('DownloadNoticeComponent', () => {
  let component: DownloadNoticeComponent;
  let fixture: ComponentFixture<DownloadNoticeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadNoticeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadNoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
