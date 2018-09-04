import { Component, OnInit, Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'onion-learning-object-description',
  template:
  `
  <div class="description-wrapper">
      <div class="input-group">
        <div class="label">How would you describe this learning object?
        <span tip="The description is a high level overview of the Learning Object that can be returned in search results">
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
