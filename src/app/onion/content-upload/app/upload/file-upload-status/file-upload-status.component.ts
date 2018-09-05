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
  @Input()
  files: DZFile[] = [];

  @Input()
  folders: { name: string, items: string, progress: number, folder: true }[];

  // this variable is recreated by virtual scroll plugin but this is needed to avoid build error
  viewportItems: any[];

  getIcon = (extension: string) => getIcon(extension);

  constructor() {}

  ngOnInit() {}

  /**
   * Concat files and foldesr array
   */
  makeArray() {
    // these types are in fact compatable
    return this.files.concat(this.folders as any);
  }
}
