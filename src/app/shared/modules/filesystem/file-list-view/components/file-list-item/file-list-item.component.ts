import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LearningObject } from '@entity';
import { getIcon } from 'app/shared/modules/filesystem/file-icons';
import { TimeFunctions } from 'app/onion/learning-object-builder/components/content-upload/app/shared/time-functions';
import { AuthService } from 'app/core/auth.service';

@Component({
  selector: 'clark-file-list-item',
  templateUrl: 'file-list-item.component.html',
  styleUrls: ['file-list-item.component.scss']
})
export class FileListItemComponent implements OnInit {
  @Input() file: LearningObject.Material.File;
  @Input() showOptionButton = false;
  @Input() inBuilder = false;
  @Output() clicked: EventEmitter<void> = new EventEmitter();
  @Output() menuClicked: EventEmitter<MouseEvent> = new EventEmitter();
  @Output() toggleClicked: EventEmitter<boolean> = new EventEmitter();

  icon = '';
  timestampAge = '';
  previewUrl = '';
  accessGroups: string[];

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.icon = getIcon(this.file.extension);
    this.timestampAge = TimeFunctions.getTimestampAge(+this.file.date);
    this.previewUrl = this.file.previewUrl;
    this.accessGroups = this.auth.accessGroups;
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
   * Updates the file's packageable property:
   *  1. Updates the file in the client to immediately display changes
   *  2. Emits toggleClicked to save the update in the database
   *
   * @param event the new packageable state
   */
  handleToggle(event: boolean) {
    this.file.packageable = event;
    this.toggleClicked.emit(event);
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
   * Checks if the current user is an admin or curator.
   * If true, allows the user to change the bundling status of a file/folder.
   *
   * @returns boolean value if the user is valid
   */
  checkAccessGroups(): boolean {
    if(this.accessGroups && this.accessGroups.length > 0) {
      return this.inBuilder && (this.accessGroups.includes('admin') || this.accessGroups.includes('editor'));
    }
    return false;
  }
}
