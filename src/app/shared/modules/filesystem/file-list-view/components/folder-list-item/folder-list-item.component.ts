import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DirectoryNode } from 'app/shared/modules/filesystem/DirectoryNode';
import { TimeFunctions } from 'app/onion/learning-object-builder/components/content-upload/app/shared/time-functions';

@Component({
  selector: 'clark-folder-list-item',
  templateUrl: 'folder-list-item.component.html',
  styleUrls: ['folder-list-item.component.scss'],
})
export class FolderListItemComponent implements OnInit {
  @Input() folder: DirectoryNode;
  @Input() showOptionButton = false;

  @Output() clicked: EventEmitter<void> = new EventEmitter();
  @Output() menuClicked: EventEmitter<MouseEvent> = new EventEmitter();

  timestampAge = '';

  constructor() {}

  ngOnInit() {
    this.timestampAge = TimeFunctions.getTimestampAge(this.getLatestDate());
  }

  /**
   * Returns the most recent date within the folder
   *
   * @param {DirectoryNode} [node=this.folder] [Current folder to recurse]
   * @param {number} [timestamp=0] [Latest timestamp found]
   * @returns {number}
   * @memberof FileListItemComponent
   */
  getLatestDate(
    node: DirectoryNode = this.folder,
    timestamp: number = 0
  ): number {
    // This is currently the only way to get this value, but we should be mindful that there may be a performance
    // cost that comes through this type of iteration in the browser.
    const derivedTimestamp = node
      .getFiles()
      .map((x) => parseInt(x.date, 10))
      .sort((a, b) => (a < b ? 1 : -1))[0];
    timestamp = timestamp > derivedTimestamp ? timestamp : derivedTimestamp;

    for (const folder of node.getFolders()) {
      return this.getLatestDate(folder, timestamp);
    }

    return timestamp;
  }

  /**
   * Emits click if click was not performed on input field
   *
   * @param {*} $event
   */
  handleClick(event: any): void {
    if (event.target.nodeName !== 'INPUT') {
      this.clicked.emit();
    }
  }

  /**
   * Emits click event of meatball was clicked
   *
   * @param {*} event
   * @memberof FileListItemComponent
   */
  handleMeatballClick(event: MouseEvent) {
    event.stopPropagation();
    this.menuClicked.emit(event);
  }

  /**
   * Recursively iterates through a chosen folder to determine if the folder itself is packageable.
   * If any one of the files within the folder is not packageable, then the folder is not packageable.
   * Mainly used for displaying the folder's packageable status, since it does not have a direct property.
   *
   * @param folder The current folder item to recursively iterate through
   * @returns The packageable status of the folder (boolean)
   */
  getFolderBundleStatus(folder: DirectoryNode): boolean {
    const files = folder.getFiles();
    const folders = folder.getFolders();
    let status = true;

    files.forEach(file => {
      if (!file.packageable) {
        status = false;
      }
    });

    folders.forEach(subFolder => {
      if(!this.getFolderBundleStatus(subFolder)) {
        status = false;
      }
    });

    return status;
  }
}
