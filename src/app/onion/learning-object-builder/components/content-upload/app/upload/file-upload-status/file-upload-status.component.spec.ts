import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploadStatusComponent } from './file-upload-status.component';

describe('FileUploadStatusComponent', () => {
  let component: FileUploadStatusComponent;
  let fixture: ComponentFixture<FileUploadStatusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [FileUploadStatusComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploadStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
