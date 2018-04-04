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
import { getIcon } from './file-icons';
import { getPaths } from '../file-functions';

export type FileEdit = {
  path: string;
  description: string;
  isFolder?: boolean;
};

@Component({
  selector: 'file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss', '../../dropzone.scss']
})
export class FileManagerComponent implements OnInit, OnDestroy {
  @ViewChild(ContextMenuComponent) public fileOptions: ContextMenuComponent;
  @Input()
  files$: BehaviorSubject<LearningObjectFile[]> = new BehaviorSubject<
    LearningObjectFile[]
  >([]);
  @Input() folderMeta$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  @Output() fileDeleted: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output() fileEdited: EventEmitter<FileEdit> = new EventEmitter<FileEdit>();
  @Output() openDZ: EventEmitter<boolean> = new EventEmitter<boolean>();
  private subscriptions: Subscription[] = [];
  private filesystem: DirectoryTree = new DirectoryTree();

  getIcon = (extension: string) => getIcon(extension);

  currentPath: string[] = [];
  currentNode: DirectoryNode;

  currentFile;

  constructor() {}
  ngOnInit(): void {
    this.subscriptions.push(
      this.files$.subscribe(files => {
        this.filesystem.addFiles(files);
        this.refreshNode();
      })
    );
    this.subscriptions.push(
      this.folderMeta$.subscribe(folders => {
        this.mapFolderMeta(folders);
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

  private mapFolderMeta(folders: any[]) {
    for (const folder of folders) {
      const paths = getPaths(folder.path, false);
      const node = this.filesystem.traversePath(paths);
      if (node) node.description = folder.description;
    }
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

  editDescription(file) {
    this.currentFile = file;
  }
  saveDescription(description: string) {
    if (!this.currentFile) return;
    let edit: FileEdit = {
      path: '',
      description: description
    };
    if (!(this.currentFile instanceof DirectoryNode)) {
      edit.path = this.currentFile.fullPath
        ? this.currentFile.fullPath
        : this.currentFile.name;
    } else {
      edit.path = this.currentFile.getPath();
      edit.isFolder = true;
    }

    this.fileEdited.emit(edit);
    this.currentFile = undefined;
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
    if (!target.className) return;

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
