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

import { DirectoryNode, DirectoryTree } from 'app/shared/modules/filesystem/DirectoryTree';

import { LearningObject } from '@entity';
import { takeUntil, take } from 'rxjs/operators';

export interface FileEdit {
  id?: string;
  path?: string;
  description: string;
  isFolder?: boolean;
}

@Component({
  selector: 'onion-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss', '../../dropzone.scss']
})
export class FileManagerComponent implements OnInit, OnDestroy {
  @Input()
  files$: BehaviorSubject<LearningObject.Material.File[]> = new BehaviorSubject<
    LearningObject.Material.File[]
  >([]);
  @Input()
  folderMeta$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  @Input()
  confirmDeletion: Subject<boolean> = new Subject<boolean>();
  @Input() deletionSuccessful$: EventEmitter<string[]> = new EventEmitter();
  @Output()
  fileDeleted: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output()
  fileEdited: EventEmitter<FileEdit> = new EventEmitter<FileEdit>();
  @Output()
  openFilePicker: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output()
  path: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  downloadClicked: EventEmitter<
    LearningObject.Material.File
  > = new EventEmitter();

  editDescription: boolean;

  menuAnchor: HTMLElement;
  menuItem: any;
  showNewOptions: boolean;
  showFileOptions: boolean;


  componentDestroyed$ = new Subject<void>();

  currentNode$: BehaviorSubject<DirectoryNode> = new BehaviorSubject<DirectoryNode>(null);

  directoryTree: DirectoryTree = new DirectoryTree();
  directoryTree$: BehaviorSubject<DirectoryTree> = new BehaviorSubject(this.directoryTree);

  constructor() {}

  ngOnInit() {
    this.files$.pipe(
      takeUntil(this.componentDestroyed$)
    ).subscribe(files => {
      this.directoryTree.addFiles(files);
      this.directoryTree$.next(this.directoryTree);
    });
  }

  /**
   * Emits clicked file
   *
   * @param {LearningObject.Material.File} file
   * @memberof FileManagerComponent
   */
  handleDownloadClick(file: LearningObject.Material.File) {
    this.downloadClicked.emit(file);
  }
  /**
   * Triggers new options context menu
   *
   * @param {MouseEvent} $event
   * @memberof FileManagerComponent
   */
  openNewOptions($event: MouseEvent): void {
    this.closeContextMenu();
    this.menuAnchor = $event.srcElement as HTMLElement;
    this.showNewOptions = true;
  }

  /**
   * Triggers file options context menu
   *
   * @param {MouseEvent} $event
   * @memberof FileManagerComponent
   */
  openFileOptions(params: { event: MouseEvent; item: any }): void {
    this.closeContextMenu();
    this.menuItem = params.item;
    this.menuAnchor = params.event.srcElement as HTMLElement;
    this.showFileOptions = true;
  }

  isDirectory(item: any): boolean {
    return item instanceof DirectoryNode;
  }

  /**
   * Closes all context menus
   *
   * @memberof FileManagerComponent
   */
  closeContextMenu() {
    this.showNewOptions = false;
    this.showFileOptions = false;
    this.menuAnchor = undefined;

    if (!this.editDescription) {
      this.menuItem = undefined;
    }
  }

  /**
   * Emits file edit
   *
   * @param {string} description
   * @param {(LearningObject.Material.File | DirectoryNode)} file
   * @returns
   * @memberof FileManagerComponent
   */
  saveDescription(
    description: string,
    file: LearningObject.Material.File | DirectoryNode
  ) {
    if (!file || !description) {
      return;
    }
    const edit: FileEdit = {
      id: '',
      path: '',
      description: description
    };

    if (!(file instanceof DirectoryNode)) {
      edit.id = file.id;
    } else {
      edit.path = file.getPath();
      edit.isFolder = true;
    }

    this.fileEdited.emit(edit);

    this.toggleEditDescription(false);
  }

  /**
   * Marks files for deletion in filesystem and emits deletion event up to parent
   */
  triggerDelete(file: DirectoryNode | File) {
    let scheduledDeletions: string[] = [];
    let name: string;
    let isFolder = false;

    if (!(file instanceof DirectoryNode)) {
      // @ts-ignore
      scheduledDeletions = [file.id];
      name = file.name;
    } else {
      const folder = file;
      scheduledDeletions = this.getFileIds(folder);
      name = folder.getName();
      isFolder = true;
    }

    this.fileDeleted.emit(scheduledDeletions);

    this.deletionSuccessful$.pipe(
      takeUntil(this.componentDestroyed$),
      take(1)
    ).subscribe(files => {
      if (files === scheduledDeletions) {
        const node = this.currentNode$.getValue();

        if (isFolder) {
          node.removeFolder(name);
        } else {
          node.removeFile(name);
        }

        this.currentNode$.next(node);
      }
    });
  }

  /**
   * Recursively gets all ids of files in folder
   *
   * @param {DirectoryNode} folder
   * @returns {string[]}
   * @memberof FileManagerComponent
   */
  getFileIds(folder: DirectoryNode): string[] {
    const children = folder.getFolders();
    const files = folder.getFiles();
    if (!children.length && !files.length) {
      return [];
    }
    let fileIds = [];
    for (const file of files) {
      fileIds.push(file.id);
    }
    for (const child of children) {
      fileIds = [...fileIds, ...this.getFileIds(child)];
    }
    return fileIds;
  }
  /**
   * Opens Folder upload dialog
   *
   * @param {boolean} [fromRoot]
   * @memberof FileManagerComponent
   */
  openFolderDialog(fromRoot?: boolean) {
    this.openFilePicker.emit(true);
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
    this.openFilePicker.emit(false);
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

    if (!value) {
      this.menuItem = undefined;
    }
  }

  ngOnDestroy() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }
}
