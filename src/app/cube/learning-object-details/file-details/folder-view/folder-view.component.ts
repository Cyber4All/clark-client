import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy
} from '@angular/core';
import { DirectoryNode } from 'app/shared/filesystem/DirectoryTree';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'folder-view',
  templateUrl: 'folder-view.component.html',
  styleUrls: ['folder-view.component.scss']
})
export class FolderViewComponent implements OnInit, OnDestroy {
  @Input()
  forceCollapse$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  @Input() folder: DirectoryNode;
  @Input() amChild: boolean;
  @Output()
  isExpanded: EventEmitter<boolean> = new EventEmitter<boolean>(false);
  private subscriptions: Subscription[] = [];

  expanded = false;
  childrenExpanded: number[] = [];
  fileCount: number = 0;
  constructor() {}

  ngOnInit() {
    this.fileCount = this.getFileCount();
    this.subscriptions.push(
      this.forceCollapse$.subscribe(force => {
        if (force) {
          this.expanded = false;
          this.childrenExpanded = [];
        }
      })
    );
  }
  /**
   * Recursively counts files in directory
   *
   * @private
   * @param {DirectoryNode} [folder]
   * @returns {number}
   * @memberof FolderViewComponent
   */
  private getFileCount(folder?: DirectoryNode): number {
    let count = 0;
    const files = folder ? folder.getFiles() : this.folder.getFiles();
    const folders = folder ? folder.getChildren() : this.folder.getChildren();
    count += files.length;

    for (const folder of folders) {
      count += this.getFileCount(folder);
    }

    return count;
  }
  /**
   * Toggles component expansion property
   *
   * @memberof FolderViewComponent
   */
  toggleExpansion() {
    this.expanded = !this.expanded;
    this.childrenExpanded = [];
    this.isExpanded.emit(this.expanded);
  }
  /**
   * Adds or removes from childrenExpanded array
   *
   * @param {any} expanded
   * @memberof FolderViewComponent
   */
  manageChildren(expanded) {
    if (expanded) {
      this.childrenExpanded.push(1);
    } else {
      this.childrenExpanded.pop();
    }
  }
  ngOnDestroy() {
    for (const sub of this.subscriptions) {
      sub.unsubscribe();
    }
  }
}
