import { Directive, HostBinding } from '@angular/core';

@Directive({
  selector: '[learningObjectCard]'
})
export class LearningObjectCardDirective {

  @HostBinding('class')
  elementClass = 'card';

  constructor() {
  }

}
