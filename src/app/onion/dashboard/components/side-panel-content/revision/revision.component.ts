import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

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
export class RevisionComponent implements OnInit {
  @Output() createRevision: EventEmitter<void> = new EventEmitter();
  hasRevision: boolean;
  revision = {
    'name': 'WCAG MAGIC 2.1: Twitches',
    'date': '91111119555766',
    'status': 'unreleased',
    'length': 'module'
  };

  meatballOpen: boolean;

  constructor() { }

  ngOnInit() {
    this.hasRevision = false;
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
