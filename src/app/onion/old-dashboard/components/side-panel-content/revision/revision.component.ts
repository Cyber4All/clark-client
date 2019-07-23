import { Component, OnInit, Input } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'clark-revision',
  templateUrl: './revision.component.html',
  styleUrls: ['./revision.component.scss'],
  animations: [
    trigger('revision', [
     transition(':enter', [
       style({ opacity: 0}),
       animate('200ms 500ms ease-out', style({ 'opacity': 1})),
       ]),
     ]),
   trigger('madeRevision', [
     transition(':leave', [
       style({ opacity: 1 }),
       animate('400ms ease-out', style({ transform: 'translateY(100px)', opacity: 0 })),
     ]),
   ])
   ]
})
export class RevisionComponent implements OnInit {

  @Input() hasRevision: boolean;
  revision = {
    'name': 'WCAG MAGIC 2.1: Twitches',
    'date': '99999999999999',
    'status': 'unreleased',
    'length': 'module'
  };

  meatballOpen: boolean;

  constructor() { }

  ngOnInit() {
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
    this.hasRevision = true;
  }

}
