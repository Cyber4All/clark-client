import { Component, Input } from '@angular/core';

@Component({
  selector: 'onion-learning-object-info-page',
  templateUrl: 'info-page.component.html'
})
export class InfoPageComponent {
  // TODO: Calculate isNew
  @Input() learningObject;

  constructor() { }
}
