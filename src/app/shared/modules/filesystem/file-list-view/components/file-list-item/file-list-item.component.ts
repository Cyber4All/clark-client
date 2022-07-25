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

  @Output() clicked: EventEmitter<void> = new EventEmitter();
  @Output() menuClicked: EventEmitter<MouseEvent> = new EventEmitter();

  icon = '';
  timestampAge = '';
  previewUrl = '';

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.icon = getIcon(this.file.extension);
    this.timestampAge = TimeFunctions.getTimestampAge(+this.file.date);
    this.previewUrl = this.file.previewUrl;
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

  toggler() {
    console.log('gottem');
  }
}
