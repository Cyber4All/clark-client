import { Component, Input } from '@angular/core';
import { NgClass, DecimalPipe } from '@angular/common';
import { ProgressComponent } from '../../../../../../../shared/components/progress/progress.component';

@Component({
    selector: 'onion-file-upload-status',
    templateUrl: './file-upload-status.component.html',
    styleUrls: ['./file-upload-status.component.scss'],
    standalone: true,
    imports: [NgClass, ProgressComponent, DecimalPipe]
})
export class FileUploadStatusComponent {
  @Input()
  uploadQueue: any[] = [];

  @Input()
  totalFiles = 0;

  @Input()
  progress = 0;
}
