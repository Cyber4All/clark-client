import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'onion-learning-object-description',
  template:
  `
  <div class="description-wrapper">
    <div class="section">
      <div class="title">Description
        <span tip="The description is a high level overview of the Learning Object that can be returned in search results">
          <i class="fas fa-question-circle"></i>
        </span>
      </div>
      <div class="goals list">
        <textarea
          class="full-width"
          rows="2"
          name="description"
          type="text"
          placeholder="Description"
          [(ngModel)]="learningObject.goals[0].text">
        </textarea>
      </div>
    </div>
  </div>
  `,
  styles: [
    `
    .description-wrapper {
      border-radius: 4px;
      background: white;
      padding: 20px;
      box-shadow: 0px 2px 2px 1px rgba(0, 0, 0, 0.1);
    }
    textarea {
      padding: 10px;
      padding-bottom: 0;
      resize: vertical;
    }
    textarea.full-width {
      width: 100%;
    }
    `
  ]
})
export class LearningObjectDescriptionComponent implements OnInit {
  @Input() learningObject;

  constructor() { }

  ngOnInit() { }
}
