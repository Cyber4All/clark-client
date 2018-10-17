import { Component, Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'onion-learning-object-description',
  template:
  `
  <div class="description-wrapper">
    <div id="description-label" class="label">How woud you describe this learning object?
    <span tip="The description is a high level overview of the Learning Object that can be returned in search results">
      <a href="http://about.clark.center/tutorial/#Descriptions" target="blank"><i class="fas fa-question-circle"></i></a>
    </span>
    </div>
    <div class="goals list">
      <clark-text-editor [(savedContent)] = "learningObject.goals[0].text"
      editorPlaceholder = "Enter description here" (textOutput) = "bindEditorOutput($event)" name="description"></clark-text-editor>
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
  @Input() learningObject;
  @Output() textOutput: EventEmitter<string> = new EventEmitter();

  constructor() { }

  bindEditorOutput(event) {
    this.learningObject.goals[0].text = event;
    this.textOutput.emit(event);
  }
}
