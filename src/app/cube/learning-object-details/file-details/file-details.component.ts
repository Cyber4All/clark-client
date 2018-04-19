import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import {
  DirectoryTree,
  DirectoryNode
} from '../../../shared/filesystem/DirectoryTree';
import { Material } from '@cyber4all/clark-entity/dist/learning-object';
import { getPaths } from 'app/shared/filesystem/file-functions';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'onion-file-details',
  templateUrl: 'file-details.component.html',
  styleUrls: ['file-details.component.scss']
})
export class FileDetailsComponent implements OnInit, OnDestroy {
  @Input() length: string;
  @Input() materials: Material;

  private directoryTree: DirectoryTree = new DirectoryTree();
  private subscriptions: Subscription[] = [];
  currentNode$: BehaviorSubject<DirectoryNode> = new BehaviorSubject<
    DirectoryNode
  >(null);

  currentPath$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  view = 'list';
  forceCollapse$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  constructor() {}

  ngOnInit() {
    this.constructTree();
    this.subscriptions.push(
      this.currentPath$.subscribe(() => {
        this.refreshNode();
      })
    );
  }

  private constructTree() {
    this.directoryTree.addFiles(this.materials.files);
    this.currentNode$.next(this.directoryTree.traversePath([]));
    if (this.materials['folderDescriptions']) {
      this.linkFolderMeta();
    }
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

  openFolder(path: string) {
    const paths = this.currentPath$.getValue();
    paths.push(path);
    this.currentPath$.next(paths);
    this.refreshNode();
  }
  private refreshNode() {
    const path = this.currentPath$.getValue();
    this.currentNode$.next(this.directoryTree.traversePath(path));
  }

  ngOnDestroy() {
    for (const sub of this.subscriptions) {
      sub.unsubscribe();
    }
  }
}
