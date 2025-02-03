/* eslint-disable @typescript-eslint/naming-convention */
import {
  Input,
  Output,
  EventEmitter,
  Component,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';

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
  selector: 'clark-text-editor',
  template: `
    <div *ngIf="showBox">
    <st-editor [(ngModel)]="editorContent" [config]="config"></st-editor>
    </div>
  `,
  styles: ['#cke_bottom_detail, .cke_bottom { display: none; }'],
})
export class TextEditorComponent implements OnInit, OnChanges {
  @Input() savedContent: string;
  @Input() editorPlaceholder: string;

  @Output() textOutput: EventEmitter<string> = new EventEmitter();
  @Output() touched: EventEmitter<void> = new EventEmitter();

  editorContent: string;
  counter: any;
  buttonText: string;

  // this flag is set to true to prevent loading an existing description triggering a save operation.
  // when false, the emit onChanges will take no action except to toggle it back to true
  initialized = true;
  acceptExternalChanges = true;
  showBox = true;
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

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.savedContent && this.acceptExternalChanges) {
      this.editorContent = changes.savedContent.currentValue;

      // this is it's first change which means we're loading an existing value, prevent emit
      if (
        changes.savedContent.firstChange &&
        changes.savedContent.currentValue
      ) {
        this.initialized = false;
      }

      this.acceptExternalChanges = false;
    }
  }

  ngOnInit() {
    this.counter = {
      showParagraphs: false,
      showWordCount: false,
      showCharCount: true,
      countSpacesAsChars: false,
      countHTML: false,
      maxWordCount: -1,
      maxCharCount: 1000,
    };

    if (this.savedContent) {
      // this.editorContent = this.savedContent;
      this.buttonText = 'Show Content';
      // this.toggleBox();
    } else {
      this.buttonText = 'Add Content';
    }
  }

  onChange() {
    if (this.initialized) {
      this.textOutput.emit(this.editorContent || '');
    } else {
      this.initialized = true;
    }
  }

  toggleBox() {
    this.showBox = !this.showBox;
    if (this.showBox === false && !this.savedContent) {
      this.buttonText = 'Add Content';
    } else if (this.showBox === false && this.savedContent) {
      this.buttonText = 'Show Content';
    } else {
      this.buttonText = 'Hide Content';
    }
  }
}
