import { Component, OnInit, Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { COPY } from './description.copy';

@Component({
  selector: 'onion-learning-object-description',
  template:
  `
  <div class="description-wrapper">
      <div class="input-group">
        <div class="label">{{ copy.QUESTION }}
        <span tip="{{ copy.TIP }}">
          <i class="fas fa-question-circle"></i>
        </span>
        </div>
        <div class="goals list">
          <text-editor [(savedContent)] = "learningObject.goals[0].text"
          editorPlaceholder = "Enter description here" (textOutput) = "bindEditorOutput($event)" name="description"></text-editor>
        </div>
      </div>
  </div>
  `,
  styles: [
    `
    textarea {
      padding: 10px;
      padding-bottom: 0;
      resize: vertical;
    }
    textarea.full-width {
      max-width: 800px;
      width: 100%;
    }
    `
  ]
})
export class LearningObjectDescriptionComponent implements OnInit {
  copy = COPY;
  @Input() learningObject;
  @Output() textOutput = new EventEmitter();

  constructor() { }

  ngOnInit() { }

  bindEditorOutput(event) {
    if ( event !== '') {
      this.learningObject.goals[0].text = event;
    }
  }
}
