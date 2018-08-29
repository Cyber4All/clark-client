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
import { DirectoryNode, LearningObjectFile } from '../DirectoryTree';
import { getIcon } from '../file-icons';
import { FormControl } from '@angular/forms';
import { DescriptionUpdate } from '../file-browser/file-browser.component';
import { TimeFunctions } from '../../../onion/content-upload/app/shared/time-functions';

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
  @Output() emitContextOpen: EventEmitter<{event: MouseEvent, item: any}> = new EventEmitter();

  private subscriptions: Subscription[] = [];
  private editableFile: LearningObjectFile | DirectoryNode;
  descriptionControl = new FormControl();
  preview = true;

  getIcon = (extension: string) => getIcon(extension);

  getTimestampAge = (timestamp: string) => TimeFunctions.getTimestampAge(+timestamp);

  getFolderTimestamp = (node: DirectoryNode = this.node$.getValue(), timestamp: number = 0): number => {
    // This is currently the only way to get this value, but we should be mindful that there may be a performance
    // cost that comes through this type of iteration in the browser.
    const derivedTimestamp = node.getFiles().map(x => parseInt(x.date, 10)).sort((a, b) => a < b ? 1 : -1)[0];
    timestamp = timestamp > derivedTimestamp ? timestamp : derivedTimestamp;

    for (const folder of node.getChildren()) {
      return this.getFolderTimestamp(folder, timestamp);
    }

    return timestamp;
  }

  constructor() {}

  ngOnInit(): void {
    this.subToDescription();

    
  }

  /**
   * Subscribe to changes in input fields
   *
   * @private
   * @memberof FileListViewComponent
   */
  private subToDescription() {
    this.subscriptions.push(
      this.descriptionControl.valueChanges
        .debounceTime(1000)
        .subscribe(description => {
          if (description) {
            this.updateDescription(description);
          }
        })
    );
  }

  /**
   * Emits desired path if not clicking an input field
   *
   * @param {string} path
   * @param {*} $event
   * @memberof FileListViewComponent
   */
  openFolder(path: string, $event: any): void {
    if ($event.target.nodeName !== 'INPUT') {
      this.emitPath.emit(path);
    }
  }

  openFile(path: string, $event: any): void {
    this.preview = false;
  }

  returnToFileView() {
    this.preview = true;
  }
  /**
   * Sets currently editable file
   *
   * @param {LearningObjectFile} file
   * @memberof FileListViewComponent
   */
  setEditable(file: LearningObjectFile | DirectoryNode) {
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

  ngOnDestroy() {
    for (const sub of this.subscriptions) {
      sub.unsubscribe();
    }
  }
}
