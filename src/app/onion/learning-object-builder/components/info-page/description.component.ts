import { Component, Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { COPY } from './description.copy';

@Component({
  selector: 'onion-learning-object-description',
  template:
  `
  <div class="description-wrapper">
      <div class="input-group">
        <div id="description-label" class="label">{{ copy.QUESTION }}
        <span tip="{{ copy.TIP }}">
          <a href="http://about.clark.center/tutorial/#Descriptions" target="blank"><i class="fas fa-question-circle"></i></a>
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
        padding: 10px 10px 0;
        resize: vertical;
      }

      textarea.full-width {
        max-width: 800px;
        width: 100%;
      }
    `
  ]
})
export class LearningObjectDescriptionComponent {
  copy = COPY;
  @Input() learningObject;
  @Output() textOutput = new EventEmitter();

  constructor() { }

  bindEditorOutput(event) {
    if ( event !== '') {
      this.learningObject.goals[0].text = event;
    }
  }
}
