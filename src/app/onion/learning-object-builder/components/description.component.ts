import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
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
  SEPARATOR
} from 'ngx-simple-text-editor';

@Component({
  selector: 'onion-learning-object-description',
  template: `
    <div class="description-wrapper">
      <!-- <div id="description-label" class="label">How woud you describe this learning object?
    <span tip="The description is a high level overview of the Learning Object that can be returned in search results">
      <a href="http://about.clark.center/tutorial/#Descriptions" target="blank"><i class="fas fa-question-circle"></i></a>
    </span>
    </div> -->
      <div class="goals list">
        <st-editor
          [formControl]="description"
          [(ngModel)]="learningObject.description"
          [config]="config"
        ></st-editor>
      </div>
    </div>
  `,
  styles: [
    `
      textarea {
        padding: 10px 10px 0;
        resize: vertical;
      }

      textarea.full-width {
        max-width: 800px;
        width: 100%;
      }
    `,
  ],
})
export class LearningObjectDescriptionComponent implements OnInit {
  @Input() learningObject;

  description = new FormControl('');
  config = {
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

  @Output() touched: EventEmitter<void> = new EventEmitter();
  @Output() textOutput: EventEmitter<string> = new EventEmitter();

  ngOnInit() {
    this.description.valueChanges.subscribe((description: string) => {
      this.textOutput.emit(description);
    });

    if (this.learningObject.description) {
      this.description.patchValue(this.learningObject.description);
    }
  }
}
