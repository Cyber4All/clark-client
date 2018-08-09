import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  Output,
  EventEmitter
} from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import {
  DirectoryNode,
  DirectoryTree
} from '../DirectoryTree';
import { File } from '@cyber4all/clark-entity/dist/learning-object';
import { getPaths } from '../file-functions';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
type LearningObjectFile = File;

// tslint:disable-next-line:interface-over-type-literal
export type Removal = {
  type: 'file' | 'folder';
  path: string;
};

// tslint:disable-next-line:interface-over-type-literal
export type DescriptionUpdate = {
  description: string;
  file: LearningObjectFile | DirectoryNode;
};

@Component({
  selector: 'clark-file-browser',
  templateUrl: 'file-browser.component.html',
  styleUrls: ['file-browser.component.scss']
})
export class FileBrowserComponent implements OnInit {
  @Input() canManage = false;
  @Input()
  files$: BehaviorSubject<LearningObjectFile[]> = new BehaviorSubject<
    LearningObjectFile[]
  >([]);
  @Input() folderMeta$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  @Input()
  handleRemove$: BehaviorSubject<Removal> = new BehaviorSubject<Removal>(null);
  @Output() path: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  containerClick: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  @Output()
  newOptionsClick: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  @Output()
  descriptionUpdated: EventEmitter<DescriptionUpdate> = new EventEmitter<
    DescriptionUpdate
  >();

  private filesystem: DirectoryTree = new DirectoryTree();

  private subscriptions: Subscription[] = [];
  currentNode$: BehaviorSubject<DirectoryNode> = new BehaviorSubject<
    DirectoryNode
  >(null);

  currentPath$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  tips = TOOLTIP_TEXT;
  view = 'list';

  constructor() {}

  ngOnInit(): void {
    this.subToFiles();
    this.subToFolderMeta();
    this.subToPaths();
    this.subToRemoval();
  }
  /**
   * Subscribe to file changes
   *
   * @private
   * @memberof FileBrowserComponent
   */
  private subToFiles(): void {
    this.subscriptions.push(
      this.files$.subscribe(files => {
        this.filesystem.addFiles(files);
        this.refreshNode();
      })
    );
  }
  /**
   * Subscribe to folder meta changes
   *
   * @private
   * @memberof FileBrowserComponent
   */
  private subToFolderMeta(): void {
    this.subscriptions.push(
      this.folderMeta$.subscribe(folders => {
        this.linkFolderMeta(folders);
      })
    );
  }
  /**
   * Subscribe to path chhanges
   *
   * @private
   * @memberof FileBrowserComponent
   */
  private subToPaths(): void {
    this.subscriptions.push(
      this.currentPath$.subscribe(() => {
        this.refreshNode();
      })
    );
  }
  /**
   * Subscribe to removals and remove specified file or folder
   *
   * @private
   * @memberof FileBrowserComponent
   */
  private subToRemoval(): void {
    this.subscriptions.push(
      this.handleRemove$.subscribe((removal: Removal) => {
        if (removal) {
          switch (removal.type) {
            case 'file':
              this.filesystem.removeFile(removal.path);
              break;
            case 'folder':
              this.filesystem.removeFolder(removal.path);
              break;
          }
        }
      })
    );
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
    const paths = this.currentPath$.getValue();
    paths.push(path);
    this.currentPath$.next(paths);
    this.refreshNode();
  }
  /**
   * Open node at current path
   *
   * @private
   * @memberof FileBrowserComponent
   */
  private refreshNode(): void {
    const path = this.currentPath$.getValue();
    this.currentNode$.next(this.filesystem.traversePath(path));
    this.path.emit(path.join('/'));
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
   * @param {{ description: string; file: LearningObjectFile }} value
   * @memberof FileBrowserComponent
   */
  emitDesc(value: DescriptionUpdate): void {
    this.descriptionUpdated.emit(value);
  }
}
