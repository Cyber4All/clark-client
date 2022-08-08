import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { DirectoryTree } from '../DirectoryTree';
import { DirectoryNode } from '../DirectoryNode';
import { LearningObject } from '@entity';
import { getPaths } from '../file-functions';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import { takeUntil } from 'rxjs/operators';
import { getUserAgentBrowser } from 'getUserAgentBrowser';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type Removal = {
  type: 'file' | 'folder';
  path: string;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type DescriptionUpdate = {
  description: string;
  file: LearningObject.Material.File | DirectoryNode;
};

@Component({
  selector: 'clark-file-browser',
  templateUrl: 'file-browser.component.html',
  styleUrls: ['file-browser.component.scss'],
})
export class FileBrowserComponent implements OnInit, OnDestroy {
  @Input() canManage = false;
  @Input()
  files$: BehaviorSubject<LearningObject.Material.File[]> = new BehaviorSubject<
    LearningObject.Material.File[]
  >([]);
  @Input() folderMeta$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  @Output() path: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  containerClick: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  @Output()
  newOptionsClick: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  @Output()
  meatballClick: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  @Output()
  descriptionUpdated: EventEmitter<DescriptionUpdate> = new EventEmitter<
    DescriptionUpdate
  >();
  @Output()
  packageableToggled: EventEmitter<{
    state: boolean,
    item: DirectoryNode | LearningObject.Material.File
  }> = new EventEmitter();

  @Input() filesystem$: BehaviorSubject<DirectoryTree> = new BehaviorSubject(
    new DirectoryTree()
  );
  private filesystem;

  private killSub$: Subject<boolean> = new Subject();

  @Input() currentNode$: BehaviorSubject<DirectoryNode> = new BehaviorSubject<
    DirectoryNode
  >(null);

  currentPath: string[] = [];
  tips = TOOLTIP_TEXT;
  view = 'list';
  dragAndDropSupported = false;

  constructor() {
    this.checkDragDropSupport();
  }

  /**
   * Checks if the user's browser is one that will support drag and drop uploads by checking the user agent
   *
   * @memberof UploadComponent
   */
  checkDragDropSupport() {
    const supportedBrowserRegex = /chrome|firefox/gi;
    const browser = getUserAgentBrowser();
    if (supportedBrowserRegex.test(browser)) {
      this.dragAndDropSupported = true;
    }
  }

  ngOnInit(): void {
    this.subToFiles();
    this.subToFolderMeta();

    this.filesystem$.pipe(takeUntil(this.killSub$)).subscribe((filesystem) => {
      if (!filesystem.isEmpty) {
        this.filesystem = filesystem;
        this.refreshFilesystem();
      }
    });
  }
  /**
   * Subscribe to file changes
   *
   * @private
   * @memberof FileBrowserComponent
   */
  private subToFiles(): void {
    this.files$.pipe(takeUntil(this.killSub$)).subscribe((files) => {
      this.refreshFilesystem(files);
    });
  }

  /**
   * Re-inits file system with added files and resets node and path to root
   *
   * @private
   * @param {LearningObject.Material.File[]} files
   * @memberof FileBrowserComponent
   */
  private refreshFilesystem(files?: LearningObject.Material.File[]) {
    if (files) {
      this.filesystem = new DirectoryTree();
      this.filesystem.addFiles(files);
      this.currentPath = [];
    }

    const node = this.filesystem.traversePath(this.currentPath);
    this.emitCurrentNode(node);
  }
  /**
   * Subscribe to folder meta changes
   *
   * @private
   * @memberof FileBrowserComponent
   */
  private subToFolderMeta(): void {
    this.folderMeta$.pipe(takeUntil(this.killSub$)).subscribe((folders) => {
      this.linkFolderMeta(folders);
    });
  }

  /**
   * Associate folder with meta data
   *
   * @private
   * @param {any[]} folders
   * @memberof FileBrowserComponent
   */
  private linkFolderMeta(folders: any[]): void {
    for (const folder of folders) {
      const paths = getPaths(folder.path, false);
      const node = this.filesystem.traversePath(paths);

      if (node) {
        node.description = folder.description;
      }
    }
  }
  /**
   * Set current node to path
   *
   * @param {string} path
   * @memberof FileBrowserComponent
   */
  openFolder(path: string): void {
    this.currentPath.push(path);
    const node = this.filesystem.getFolder(this.currentNode$.value, path);
    this.emitCurrentNode(node);
  }

  /**
   * Determines what node to refresh the view with by checking the path change
   * If the path decreased in length by 1, we know that the user clicked one directory higher from breadcrumbs
   * So, no traversal is needed. Just emit the parent node
   *
   * If the path changed by more than 1, the user jumped multiple directories and we need to traverse to find node to emit
   *
   * @param {string[]} paths
   * @memberof FileBrowserComponent
   */
  handlePathChanged(paths: string[]): void {
    let node;
    if (this.currentPath.length - paths.length === 1) {
      node = this.currentNode$.value.getParent();
    } else {
      node = this.filesystem.traversePath(paths);
    }
    this.currentPath = paths;
    this.emitCurrentNode(node);
  }

  /**
   * Emit node at current path
   *
   * @private
   * @memberof FileBrowserComponent
   */
  private emitCurrentNode(node: DirectoryNode): void {
    this.currentNode$.next(node);
    this.path.emit(this.currentPath.join('/'));
  }
  /**
   * Emit click event on container
   *
   * @param {MouseEvent} $event
   * @memberof FileBrowserComponent
   */
  emitContainerClick($event: MouseEvent): void {
    this.containerClick.emit($event);
  }
  /**
   * Emit click event on new button
   *
   * @param {MouseEvent} $event
   * @memberof FileBrowserComponent
   */
  emitNewOptionClick($event: MouseEvent): void {
    this.newOptionsClick.emit($event);
  }
  /**
   * Emit updated description and file
   *
   * @param {{ description: string; file: LearningObject.Material.File }} value
   * @memberof FileBrowserComponent
   */
  emitDesc(value: DescriptionUpdate): void {
    this.descriptionUpdated.emit(value);
  }

  ngOnDestroy() {
    this.killSub$.next(true);
    this.killSub$.unsubscribe();
  }
}
