import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import {
  LearningObjectFile,
  DirectoryTree,
  DirectoryNode
} from '../DirectoryTree';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss', '../../dropzone.scss']
})
export class FileManagerComponent implements OnInit, OnDestroy {
  @Input() files$: BehaviorSubject<LearningObjectFile[]>;
  @Input() queuedUploads$: BehaviorSubject<LearningObjectFile[]>;
  private subscriptions: Subscription[] = [];
  private filesystem: DirectoryTree = new DirectoryTree();
  files: LearningObjectFile[] = [];
  queuedUploads: LearningObjectFile[] = [];

  currentPath: string[] = [];
  currentNode: DirectoryNode;

  constructor() {}
  ngOnInit(): void {
    this.subscriptions.push(
      this.files$.subscribe(files => {
        this.filesystem.addFiles(files);
        console.log('FILESYSTEM: ', this.filesystem);
        this.refreshNode();
      })
    );
    // this.subscriptions.push(
    //   this.queuedUploads$.subscribe(queuedUploads => {
    //     this.queuedUploads = queuedUploads;
    //     this.filesystem.addFiles(queuedUploads);
    //     console.log('FILESYSTEM: ', this.filesystem);
    //     this.refreshNode();
    //   })
    // );
  }

  /**
   * Constructs a new DirectoryTree with files
   *
   * @private
   * @param {LearningObjectFile[]} files
   * @memberof UploadComponent
   */
  private constructFileSystem(files: LearningObjectFile[]) {
    this.filesystem.addFiles(files);
  }

  /**
   * Adds file to file system
   *
   * @private
   * @param {any} file
   * @memberof UploadComponent
   */
  private addToFileSystem(file) {
    this.filesystem.addFiles([file]);
  }

  openFolder(path: string) {
    this.currentPath.push(path);
    this.refreshNode();
  }

  jumpTo(index: number) {
    let path;
    if (index === 0) {
      path = [];
    } else {
      path = this.currentPath.slice(0, index + 1);
    }
    if (JSON.stringify(path) !== JSON.stringify(this.currentPath)) {
      this.currentPath = path;
      this.refreshNode();
    }
  }
  private refreshNode() {
    let path = this.currentPath;
    this.currentNode = this.filesystem.traversePath(path);
    console.log('NODE AT: ', path, this.currentNode);
  }

  ngOnDestroy(): void {
    for (let sub of this.subscriptions) {
      sub.unsubscribe();
    }
  }
}
