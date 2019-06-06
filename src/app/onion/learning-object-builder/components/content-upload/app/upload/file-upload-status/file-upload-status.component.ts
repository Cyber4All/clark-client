import { Component, Input } from '@angular/core';

@Component({
  selector: 'onion-file-upload-status',
  templateUrl: './file-upload-status.component.html',
  styleUrls: ['./file-upload-status.component.scss']
})
export class FileUploadStatusComponent {
  @Input()
  uploadQueue: any[] = [];

  @Input()
  totalFiles = 0;

  @Input()
  progress = 0;
}
