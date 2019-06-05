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

import { DirectoryNode } from '../../../../../../shared/filesystem/DirectoryTree';

import { LearningObject } from '@entity';

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
  @ViewChild('fileOptions')
  public fileOptions: ContextMenuComponent;
  @ViewChild('newOptions')
  public newOptions: ContextMenuComponent;

  @Input()
  files$: BehaviorSubject<LearningObject.Material.File[]> = new BehaviorSubject<
    LearningObject.Material.File[]
  >([]);
  @Input()
  folderMeta$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  @Input()
  confirmDeletion: Subject<boolean> = new Subject<boolean>();
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

  componentDestroyed$ = new Subject<void>();

  constructor(private contextMenuService: ContextMenuService) {}
  ngOnInit(): void {}

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
   * Triggers file options context menu
   *
   * @param {MouseEvent} $event
   * @memberof FileManagerComponent
   */
  openFileOptions(params: { event: MouseEvent; item: any }): void {
    this.contextMenuService.show.next({
      anchorElement: params.event.currentTarget,
      contextMenu: this.fileOptions,
      event: <any>params.event,
      item: params.item
    });
    params.event.preventDefault();
    params.event.stopPropagation();
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
  }

  /**
   * Marks files for deletion in filesystem and emits deletion event up to parent
   */
  triggerDelete(file) {
    let scheduledDeletions: string[] = [];

    if (!(file instanceof DirectoryNode)) {
      scheduledDeletions = [file.id];
    } else {
      const folder = file;
      scheduledDeletions = this.getFileIds(folder);
    }

    this.fileDeleted.emit(scheduledDeletions);
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
  }

  ngOnDestroy() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }
}
