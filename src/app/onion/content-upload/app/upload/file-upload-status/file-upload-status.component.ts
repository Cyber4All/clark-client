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
   * Returns array of files that are not in a folder
   *
   * @returns
   * @memberof FileUploadStatusComponent
   */
  filterFiles() {
    return this.files.filter(file => !file.rootFolder);
  }

  /**
   * Concat files and foldesr array
   */
  makeArray() {
    // these types are in fact compatable
    return this.files.concat(this.folders as any);
  }

  /**
   * Returns array of Folder objects
   *
   * @returns
   * @memberof FileUploadStatusComponent
   */
  filterFolders() {
    const folders: { items: number; progress: number; name: string }[] = [];
    const folderMap = new Map<string, number>();
    const files = this.files.filter(f => f.rootFolder);

    for (const file of files) {
      const index = folderMap.get(file.rootFolder);
      let folder = folders[index];
      if (folder) {
        folder.items++;
        folder.progress = (folder.progress + (file.progress ? file.progress : 0)) / 2;
        folders[index] = folder;
      } else {
        folder = {
          items: 1,
          progress: file.progress ? file.progress : 0,
          name: file.rootFolder
        };
        folders.push(folder);
        folderMap.set(file.rootFolder, folders.length - 1);
      }
    }
    return folders;
  }
}
