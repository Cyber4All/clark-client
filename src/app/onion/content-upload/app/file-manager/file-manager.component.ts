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
} from '../../../../shared/filesystem/DirectoryTree';
import { getPaths } from '../../../../shared/filesystem/file-functions';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import { Removal } from '../../../../shared/filesystem/file-browser/file-browser.component';
type LearningObjectFile = File;

export type FileEdit = {
  path: string;
  description: string;
  isFolder?: boolean;
};

@Component({
  selector: 'onion-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss', '../../dropzone.scss']
})
export class FileManagerComponent implements OnInit {
  @ViewChild('fileOptions') public fileOptions: ContextMenuComponent;
  @ViewChild('newOptions') public newOptions: ContextMenuComponent;

  @Input()
  files$: BehaviorSubject<LearningObjectFile[]> = new BehaviorSubject<
    LearningObjectFile[]
  >([]);
  @Input() folderMeta$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  @Output()
  fileDeleted: EventEmitter<{
    files: string[];
    removal: Removal;
  }> = new EventEmitter<{ files: string[]; removal: Removal }>();
  @Output() fileEdited: EventEmitter<FileEdit> = new EventEmitter<FileEdit>();
  @Output() openDZ: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() path: EventEmitter<string> = new EventEmitter<string>();

  removal$: BehaviorSubject<Removal> = new BehaviorSubject<Removal>(
    null
  );
  editDescription: boolean;

  constructor(private contextMenuService: ContextMenuService) {}
  ngOnInit(): void {}

  /**
   * Triggers new options context menu
   *
   * @param {MouseEvent} $event
   * @memberof FileManagerComponent
   */
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
  /**
   * Closes all context menus
   *
   * @memberof FileManagerComponent
   */
  closeContextMenu() {
    this.contextMenuService.closeAllContextMenus({
      eventType: 'cancel'
    });
  }
  /**
   * Emits file edit
   *
   * @param {string} description
   * @param {(LearningObjectFile | DirectoryNode)} file
   * @returns
   * @memberof FileManagerComponent
   */
  saveDescription(
    description: string,
    file: LearningObjectFile | DirectoryNode
  ) {
    if (!file || !description) {
      return;
    }
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
  /**
   * Deletes file from Filesystem and emits array of files to be deleted
   *
   * @param {any} file
   * @memberof FileManagerComponent
   */
  deleteFile(file) {
    let removal: Removal;
    let scheduledDeletions: string[] = [];
    if (!(file instanceof DirectoryNode)) {
      scheduledDeletions = [file.fullPath ? file.fullPath : file.name];
      removal = {
        type: 'file',
        path: file.fullPath ? file.fullPath : file.name
      };
    } else {
      const folder = file;
      removal = { type: 'folder', path: folder.getPath() };
      scheduledDeletions = this.getFilePaths(folder);
    }
    this.removal$.next(removal);
    this.fileDeleted.emit({ removal, files: scheduledDeletions });
  }
  /**
   * Recursively gets all paths of files in folder
   *
   * @param {DirectoryNode} folder
   * @returns {string[]}
   * @memberof FileManagerComponent
   */
  getFilePaths(folder: DirectoryNode): string[] {
    const children = folder.getChildren();
    const files = folder.getFiles();
    if (!children.length && !files.length) {
      return [];
    }
    let filePaths = [];
    for (const file of files) {
      filePaths.push(file.fullPath);
    }
    for (const child of children) {
      filePaths = [...filePaths, ...this.getFilePaths(child)];
    }
    return filePaths;
  }
  /**
   * Opens Folder upload dialog
   *
   * @param {boolean} [fromRoot]
   * @memberof FileManagerComponent
   */
  openFolderDialog(fromRoot?: boolean) {
    const fileInput = document.querySelector('.dz-hidden-input');
    fileInput.setAttribute('directory', 'true');
    fileInput.setAttribute('webkitdirectory', 'true');
    fileInput.setAttribute('mozdirectory', 'true');
    fileInput.setAttribute('msdirectory', 'true');
    fileInput.setAttribute('odirectory', 'true');
    this.openDZ.emit(true);
    if (fromRoot) {
      this.path.emit();
    }
  }
  /**
   * Opens File Upload Dialog
   *
   * @param {boolean} [fromRoot]
   * @memberof FileManagerComponent
   */
  openFileDialog(fromRoot?: boolean) {
    const fileInput = document.querySelector('.dz-hidden-input');
    fileInput.removeAttribute('directory');
    fileInput.removeAttribute('webkitdirectory');
    fileInput.removeAttribute('mozdirectory');
    fileInput.removeAttribute('msdirectory');
    fileInput.removeAttribute('odirectory');
    this.openDZ.emit(true);
    if (fromRoot) {
      this.path.emit();
    }
  }
  /**
   * Handles click event on container
   * If on empty area dropzone upload dialog is triggered
   *
   * @param {any} e
   * @returns
   * @memberof FileManagerComponent
   */
  handleContainerClick(e) {
    const target = e.target;
    if (!target.className) {
      return;
    }

    const classNames: string[] = target.className.trim().split(' ');
    if (classNames.includes('dz-clickable')) {
      this.openFileDialog();
    }
  }
  /**
   * Emits current path
   *
   * @param {string} path
   * @memberof FileManagerComponent
   */
  emitPath(path: string) {
    this.path.emit(path);
  }

  toggleEditDescription(value: boolean): void {
    this.editDescription = value;
  }
}
