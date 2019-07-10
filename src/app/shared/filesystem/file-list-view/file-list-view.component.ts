import { debounceTime, takeUntil } from 'rxjs/operators';
import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  Output,
  EventEmitter
} from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { DirectoryNode } from '../DirectoryTree';
import { FormControl } from '@angular/forms';
import { DescriptionUpdate } from '../file-browser/file-browser.component';
import { LearningObject } from '@entity';
import { AuthService } from 'app/core/auth.service';
import { getPreviewUrl } from '../file-functions';

@Component({
  selector: 'clark-file-list-view',
  templateUrl: 'file-list-view.component.html',
  styleUrls: ['file-list-view.component.scss']
})
export class FileListViewComponent implements OnInit, OnDestroy {
  @Input()
  canManage = false;
  @Input()
  node$: BehaviorSubject<DirectoryNode> = new BehaviorSubject<DirectoryNode>(
    null
  );
  @Output()
  emitPath: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  emitDesc: EventEmitter<DescriptionUpdate> = new EventEmitter<
    DescriptionUpdate
  >();
  @Output()
  emitContextOpen: EventEmitter<{
    event: MouseEvent;
    item: any;
  }> = new EventEmitter();

  private editableFile: LearningObject.Material.File | DirectoryNode;

  private killSub$: Subject<boolean> = new Subject();

  descriptionControl = new FormControl();
  preview = true;
  file: LearningObject.Material.File;
  directoryListing = [];

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.subToDirChange();
    this.subToDescription();
  }

  /**
   * Subscribes to current node to detect directory changes. Refreshes directory listing with folders and files at current node
   *
   * @private
   * @memberof FileListViewComponent
   */
  private subToDirChange() {
    this.node$.pipe(takeUntil(this.killSub$)).subscribe(node => {
      this.directoryListing = node.getFolders().concat(node.getFiles() as any);
    });
  }

  /**
   * Subscribe to changes in input fields
   *
   * @private
   * @memberof FileListViewComponent
   */
  private subToDescription() {
    this.descriptionControl.valueChanges
      .pipe(
        takeUntil(this.killSub$),
        debounceTime(1000)
      )
      .subscribe(description => {
        if (description) {
          this.updateDescription(description);
        }
      });
  }

  /**
   * Emits desired path if not clicking an input field
   *
   * @param {string} path
   * @memberof FileListViewComponent
   */
  openFolder(path: string): void {
    this.emitPath.emit(path);
  }

  /**
   * Opens file preview if the user is logged in
   *
   * @param {LearningObject.Material.File} file
   * @memberof FileListViewComponent
   */
  openFile(file: LearningObject.Material.File): void {
    const url = this.auth.isLoggedIn.value ? getPreviewUrl(file) : '';
    if (url) {
      window.open(url, '_blank');
      this.preview = true;
    } else {
      this.file = file;
      this.preview = false;
    }
  }

  /**
   * Emits event indicating context menu should be opened
   *
   * @param {MouseEvent} event
   * @param {(DirectoryNode | LearningObject.Material.File)} item
   * @memberof FileListViewComponent
   */
  handleMenuClicked(
    event: MouseEvent,
    item: DirectoryNode | LearningObject.Material.File
  ) {
    event.stopPropagation();
    this.emitContextOpen.next({ event, item });
  }

  returnToFileView() {
    this.preview = true;
  }
  /**
   * Sets currently editable file
   *
   * @param {LearningObject.Material.File} file
   * @memberof FileListViewComponent
   */
  setEditable(file: LearningObject.Material.File | DirectoryNode) {
    this.editableFile = file;
  }
  /**
   * Emits event to update description
   *
   * @param {string} description
   * @memberof FileListViewComponent
   */
  updateDescription(description: string) {
    description = description.trim();
    this.emitDesc.emit({ description, file: this.editableFile });
  }

  /**
   * Track by function to improve performance of ngFor/cdkFor loop
   *
   * @param {number} index [Index of the current element]
   * @param {(DirectoryNode | LearningObject.Material.File)} elm [The current element]
   * @returns
   * @memberof FileListViewComponent
   */
  trackItems(index: number, elm: DirectoryNode | LearningObject.Material.File) {
    if (elm instanceof DirectoryNode) {
      return elm.getPath();
    }
    return elm.id || index;
  }

  ngOnDestroy() {
    this.killSub$.next(true);
    this.killSub$.unsubscribe();
  }
}
