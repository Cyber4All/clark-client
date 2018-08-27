import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  EventEmitter,
  Output,
  ViewChild
} from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ContextMenuComponent, ContextMenuService } from 'ngx-contextmenu';
import { File } from '@cyber4all/clark-entity/dist/learning-object';
import {
  DirectoryNode
} from '../../../../shared/filesystem/DirectoryTree';
import { Removal } from '../../../../shared/filesystem/file-browser/file-browser.component';
import 'rxjs/add/operator/takeUntil';

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
export class FileManagerComponent implements OnInit, OnDestroy {
  @ViewChild('fileOptions') public fileOptions: ContextMenuComponent;
  @ViewChild('newOptions') public newOptions: ContextMenuComponent;

  @Input()
  files$: BehaviorSubject<LearningObjectFile[]> = new BehaviorSubject<
    LearningObjectFile[]
  >([]);
  @Input() folderMeta$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  @Input() confirmDeletion: Subject<boolean> = new Subject<boolean>();
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

  filesMarkedForDelete: {removal: Removal, scheduledDeletions: string[]}[] = [];

  componentDestroyed$ = new Subject<void>();

  constructor(private contextMenuService: ContextMenuService) {}
  ngOnInit(): void {
    // This obserbale emits when the user confirms deletion of a file
    // at which point we should delete all files that are marked for deletion
    this.confirmDeletion.takeUntil(this.componentDestroyed$).subscribe(shouldDelete => {
      if (shouldDelete) {
        this.deleteMarked();
      }

      // these files are deleted and this array can be emptied now
      this.filesMarkedForDelete = [];
    });
  }

  /**
   * Triggers new options context menu
   *
   * @param {MouseEvent} $event
   * @memberof FileManagerComponent
   */
  openNewOptions($event: MouseEvent): void {
    this.contextMenuService.show.next({
      anchorElement: $event.currentTarget,
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
   * Marks files for deletion in filesystem and emits deletion event up to parent
   */
  triggerDelete(file) {
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

    this.filesMarkedForDelete.push({removal, scheduledDeletions});

    this.fileDeleted.emit({ removal, files: scheduledDeletions });
  }


  /**
   * Iterates the filesMarkedForDelete array and deletes each
   */
  deleteMarked() {
    for (const x of this.filesMarkedForDelete) {
      this.deleteFile(x.removal);
    }
  }

  /**
   * Deletes file from Filesystem and emits array of files to be deleted
   *
   * @param {any} removal instance of Removal
   * @memberof FileManagerComponent
   */
  deleteFile(removal: Removal) {
    this.removal$.next(removal);
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

  ngOnDestroy() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }
}
