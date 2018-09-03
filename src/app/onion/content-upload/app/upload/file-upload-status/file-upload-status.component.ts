import { Component, OnInit, Input } from '@angular/core';
import { getIcon } from '../../../../../shared/filesystem/file-icons';

import 'rxjs/add/operator/takeUntil';
import { DZFile } from '../upload.component';

@Component({
  selector: 'onion-file-upload-status',
  templateUrl: './file-upload-status.component.html',
  styleUrls: ['./file-upload-status.component.scss']
})
export class FileUploadStatusComponent implements OnInit {
  @Input() files: DZFile;

  getIcon = (extension: string) => getIcon(extension);

  constructor() { }

  ngOnInit() {
  }

}
