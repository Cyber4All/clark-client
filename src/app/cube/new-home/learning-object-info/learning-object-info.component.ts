import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

export enum LEARNING_OBJECT_INFO_STATES {
  LEARNING_OBJECT = 'learningObject',
  LEARNING_OUTCOMES = 'learningOutcomes',
  HIERARCHIES = 'hierarchies',
  COLLECTIONS = 'collections'
};

@Component({
  selector: 'clark-learning-object-info',
  templateUrl: './learning-object-info.component.html',
  styleUrls: ['./learning-object-info.component.scss']
})
export class LearningObjectInfoComponent implements OnInit {
  currentComponent: LEARNING_OBJECT_INFO_STATES;

  constructor() { }

  ngOnInit(): void {
  }

  @ViewChild('learningObject')
  private learningObjectDiv: ElementRef<HTMLDivElement>;

  @ViewChild('learningOutcomes')
  private learningOutcomeDiv: ElementRef<HTMLDivElement>;

  @ViewChild('hierarchies')
  private hierarchiesDiv: ElementRef<HTMLDivElement>;

  @ViewChild('collections')
  private collctionDiv: ElementRef<HTMLDivElement>;

  /**
   * Updates currentComponent when a div is on the screen
   */
  @HostListener('window:scroll', ['$event'])
  isScrolledIntoView() {
    if (this.learningObjectDiv) {
      const rect = this.learningObjectDiv.nativeElement.getBoundingClientRect();
      if (this.isAtTopOfScreen(rect)) {
        this.currentComponent = LEARNING_OBJECT_INFO_STATES.LEARNING_OBJECT;
        return;
      }
    }
    if (this.learningOutcomeDiv) {
      const rect = this.learningOutcomeDiv.nativeElement.getBoundingClientRect();
      if (this.isAtTopOfScreen(rect)) {
        this.currentComponent = LEARNING_OBJECT_INFO_STATES.LEARNING_OUTCOMES;
        return;
      }
    }
    if (this.hierarchiesDiv) {
      const rect = this.hierarchiesDiv.nativeElement.getBoundingClientRect();
      if (this.isAtTopOfScreen(rect)) {
        this.currentComponent = LEARNING_OBJECT_INFO_STATES.HIERARCHIES;
        return;
      }
    }
    if (this.collctionDiv) {
      const rect = this.collctionDiv.nativeElement.getBoundingClientRect();
      if (this.isAtTopOfScreen(rect)) {
        this.currentComponent = LEARNING_OBJECT_INFO_STATES.COLLECTIONS;
        return;
      }
    }
  }

  /**
   * Checks to see if a div is at the top of the screen.
   * As long as either the top of the div or the bottom of the div are in view
   * Then the div is considered "in view" and will be highlighted
   *
   * @param rect THe DOMRect
   * @returns True if the div is at the top of the screen
   */
  isAtTopOfScreen(rect: DOMRect) {
    const topShown = rect.top >= 0;

    // Most of the div is gone so switch to next div
    // Also helps with the # (bookmark) transitions
    const bottomShown =  rect.bottom >= 50;
    return topShown || bottomShown;
  }
}
