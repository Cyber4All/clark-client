import { Directive, Renderer2, ElementRef } from '@angular/core';

@Directive({
  selector: '[learningObjectCard]'
})
export class LearningObjectCardDirective {

  constructor(renderer: Renderer2, hostElement: ElementRef) {
    renderer.addClass(hostElement.nativeElement, 'card');
  }

}
