import { Component, OnInit, Input } from '@angular/core';
import {
  DirectoryTree,
  DirectoryNode
} from '../../../shared/filesystem/DirectoryTree';
import { Material } from '@cyber4all/clark-entity/dist/learning-object';
import { getPaths } from 'app/shared/filesystem/file-functions';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'onion-file-details',
  templateUrl: 'file-details.component.html',
  styleUrls: ['file-details.component.scss']
})
export class FileDetailsComponent implements OnInit {
  @Input() length: string;
  @Input() materials: Material;

  forceCollapse$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  private directoryTree: DirectoryTree = new DirectoryTree();
  rootNode: DirectoryNode;

  constructor() {}

  ngOnInit() {
    this.constructTree();
  }

  private constructTree() {
    this.directoryTree.addFiles(this.materials.files);
    this.rootNode = this.directoryTree.traversePath([]);
    this.linkFolderMeta();
  }

  private linkFolderMeta() {
    // FIXME: Add folder descriptions to entity
    const folders = this.materials['folderDescriptions'];
    for (const folder of folders) {
      const paths = getPaths(folder.path, false);
      const node = this.directoryTree.traversePath(paths);
      if (node) {
        node.description = folder.description;
      }
    }
  }
  /**
   * Send force collapse signal to folder views
   *
   * @memberof FileDetailsComponent
   */
  forceCollapse() {
    this.forceCollapse$.next(true);
  }
}
