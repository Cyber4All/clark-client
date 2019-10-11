import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { LearningObject } from 'entity/learning-object/learning-object';

@Component({
  selector: 'clark-revision',
  templateUrl: './revision.component.html',
  styleUrls: ['./revision.component.scss'],
  animations: [
    trigger('revision', [
     transition(':enter', [
       style({ opacity: 0, transform: 'translateX(-100%)', position: 'absolute', right: '20px', left: '20px'}),
       animate('200ms 400ms ease-out', style({ 'opacity': 1, transform: 'translateX(0%)'})),
       ]),
     ]),
   trigger('madeRevision', [
     transition(':leave', [
       style({ opacity: 1, position: 'absolute'}),
       animate('200ms ease-out', style({ opacity: 0, transform: 'scale(0)'})),
     ]),
   ])
   ]
})
export class RevisionComponent implements OnChanges {
  @Output() createRevision: EventEmitter<void> = new EventEmitter();
  @Input() hasRevision: boolean;
  @Input() revision: LearningObject[];

  meatballOpen: boolean;

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    this.hasRevision = false;
    if (this.revision) {
      this.hasRevision = true;
    }
  }

    /**
   * Toggles the context menu on and off
   */
  toggleContextMenu() {
    this.meatballOpen = !this.meatballOpen;
  }

  /**
   * Create a revision of the object that is currently released
   */
  makeRevision() {
    this.createRevision.emit();
    this.hasRevision = true;
  }

}
