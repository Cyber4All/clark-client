import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  BOLD_BUTTON,
  ITALIC_BUTTON,
  LINK_INPUT,
  ORDERED_LIST_BUTTON,
  REDO_BUTTON,
  REMOVE_FORMAT_BUTTON,
  UNDERLINE_BUTTON,
  UNDO_BUTTON,
  UNORDERED_LIST_BUTTON,
  SEPARATOR,
} from 'ngx-simple-text-editor';

@Component({
  selector: 'clark-edit-changelog',
  templateUrl: './edit-changelog.component.html',
  styleUrls: ['./edit-changelog.component.scss'],
})
export class EditChangelogComponent implements OnInit {
  config = {
    placeholder: 'What changes were made to this Learning Object?',
    buttons: [
      UNDO_BUTTON,
      REDO_BUTTON,
      SEPARATOR,
      BOLD_BUTTON,
      ITALIC_BUTTON,
      UNDERLINE_BUTTON,
      SEPARATOR,
      REMOVE_FORMAT_BUTTON,
      SEPARATOR,
      ORDERED_LIST_BUTTON,
      UNORDERED_LIST_BUTTON,
      SEPARATOR,
      LINK_INPUT,
    ],
  };

  changelog = '';

  @Output() confirm: EventEmitter<string> = new EventEmitter();
  @Output() back: EventEmitter<void> = new EventEmitter();
  @Output() cancel: EventEmitter<void> = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  completeChangelog() {
    this.confirm.emit(this.changelog);
  }
}
