import { Directive, Renderer2, ElementRef } from "@angular/core";

@Directive({
    selector: "[learningObjectCard]",
    standalone: true,
})
export class LearningObjectCardDirective {
    constructor(renderer: Renderer2, hostElement: ElementRef) {
        renderer.addClass(hostElement.nativeElement, "card");
    }
}
