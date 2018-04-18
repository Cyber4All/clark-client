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
import { BehaviorSubject, Subscription } from 'rxjs';
import { ContextMenuComponent, ContextMenuService } from 'ngx-contextmenu';
import { FileStorageService } from '../services/file-storage.service';
import { File } from '@cyber4all/clark-entity/dist/learning-object';
import {
  DirectoryTree,
  DirectoryNode
} from 'app/shared/filesystem/DirectoryTree';
import { getPaths } from 'app/shared/filesystem/file-functions';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
type LearningObjectFile = File;

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
  @ViewChild('fileOptions') public fileOptions: ContextMenuComponent;
  @ViewChild('newOptions') public newOptions: ContextMenuComponent;

  @Input()
  files$: BehaviorSubject<LearningObjectFile[]> = new BehaviorSubject<
    LearningObjectFile[]
  >([]);
  @Input() folderMeta$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  @Output() fileDeleted: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output() fileEdited: EventEmitter<FileEdit> = new EventEmitter<FileEdit>();
  @Output() openDZ: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() path: EventEmitter<string> = new EventEmitter<string>();

  private subscriptions: Subscription[] = [];
  private filesystem: DirectoryTree = new DirectoryTree();

  currentPath: string[] = [];
  currentNode$: BehaviorSubject<DirectoryNode> = new BehaviorSubject<
    DirectoryNode
  >(null);

  editDescription = false;
  view = 'list';
  tips = TOOLTIP_TEXT;

  constructor(private contextMenuService: ContextMenuService) {}
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

  openNewOptions($event: MouseEvent): void {
    this.contextMenuService.show.next({
      anchorElement: $event.target,
      contextMenu: this.newOptions,
      event: <any>$event,
      item: undefined
    });
    $event.preventDefault();
    $event.stopPropagation();
  }

  closeContextMenu() {
    this.contextMenuService.closeAllContextMenus({
      eventType: 'cancel'
    });
  }

  saveDescription(
    description: string,
    file: LearningObjectFile | DirectoryNode
  ) {
    if (!file || !description) return;

    const edit: FileEdit = {
      path: '',
      description: description
    };

    if (!(file instanceof DirectoryNode)) {
      edit.path = file.fullPath ? file.fullPath : file.name;
    } else {
      edit.path = file.getPath();
      edit.isFolder = true;
    }

    this.fileEdited.emit(edit);
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

  openFolderDialog(fromRoot?: boolean) {
    const fileInput = document.querySelector('.dz-hidden-input');
    fileInput.setAttribute('directory', 'true');
    fileInput.setAttribute('webkitdirectory', 'true');
    fileInput.setAttribute('mozdirectory', 'true');
    fileInput.setAttribute('msdirectory', 'true');
    fileInput.setAttribute('odirectory', 'true');
    this.openDZ.emit(true);
    if (fromRoot) this.path.emit();
  }

  openFileDialog(fromRoot?: boolean) {
    const fileInput = document.querySelector('.dz-hidden-input');
    fileInput.removeAttribute('directory');
    fileInput.removeAttribute('webkitdirectory');
    fileInput.removeAttribute('mozdirectory');
    fileInput.removeAttribute('msdirectory');
    fileInput.removeAttribute('odirectory');
    this.openDZ.emit(true);
    if (fromRoot) this.path.emit();
  }

  handleClick(e) {
    const target = e.target;
    if (!target.className) return;

    const classNames: string[] = target.className.trim().split(' ');
    if (classNames.includes('dz-clickable')) {
      this.openFileDialog();
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
    const path = this.currentPath;
    this.currentNode$.next(this.filesystem.traversePath(path));
    this.path.emit(path.join('/'));
  }

  ngOnDestroy(): void {
    for (let sub of this.subscriptions) {
      sub.unsubscribe();
    }
  }
}
