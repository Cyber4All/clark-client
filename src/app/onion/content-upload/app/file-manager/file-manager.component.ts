import {
  Component,
  OnInit,
  Input,
  OnChanges,
  OnDestroy,
  EventEmitter,
  Output,
  ViewChild
} from '@angular/core';
import {
  LearningObjectFile,
  DirectoryTree,
  DirectoryNode
} from '../DirectoryTree';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ContextMenuComponent } from 'ngx-contextmenu';
import { FileStorageService } from '../services/file-storage.service';

@Component({
  selector: 'file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss', '../../dropzone.scss']
})
export class FileManagerComponent implements OnInit, OnDestroy {
  @ViewChild(ContextMenuComponent) public fileOptions: ContextMenuComponent;
  @Input() files$: BehaviorSubject<LearningObjectFile[]>;
  @Output() fileDeleted: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output() openDZ: EventEmitter<boolean> = new EventEmitter<boolean>();
  private subscriptions: Subscription[] = [];
  private filesystem: DirectoryTree = new DirectoryTree();

  currentPath: string[] = [];
  currentNode: DirectoryNode;

  constructor() {}
  ngOnInit(): void {
    this.subscriptions.push(
      this.files$.subscribe(files => {
        this.filesystem.addFiles(files);
        this.refreshNode();
        console.log(files);
      })
    );
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

  deleteFile(file) {
    let scheduledDeletions: string[] = [];
    if (!(file instanceof DirectoryNode)) {
      scheduledDeletions = [file.fullPath ? file.fullPath : file.name];
      this.filesystem.removeFile(file.fullPath ? file.fullPath : file.name);
    } else {
      const folder = file;
      this.filesystem.removeFolder(folder.getPath());
      scheduledDeletions = this.getFilePaths(folder);
    }
    this.fileDeleted.emit(scheduledDeletions);
  }

  getFilePaths(folder: DirectoryNode): string[] {
    const children = folder.getChildren();
    const files = folder.getFiles();
    if (!children.length && !files.length) {
      return [];
    }
    let filePaths = [];
    for (let file of files) {
      filePaths.push(file.fullPath);
    }
    for (let child of children) {
      filePaths = [...filePaths, ...this.getFilePaths(child)];
    }
    return filePaths;
  }

  openDropzone(e) {
    const target = e.target;
    const classNames: string[] = target.className.trim().split(' ');
    if (classNames.includes('dz-clickable')) {
      this.openDZ.emit(true);
    }
  }

  openFolder(path: string) {
    this.currentPath.push(path);
    this.refreshNode();
  }

  jumpTo(index: number, root?: boolean) {
    let path;
    if (root) {
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
  }

  ngOnDestroy(): void {
    for (let sub of this.subscriptions) {
      sub.unsubscribe();
    }
  }
}
