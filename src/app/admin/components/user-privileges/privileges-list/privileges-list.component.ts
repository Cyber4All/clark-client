import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { privilegesListAnimations } from './privileges-list.component.animations';

@Component({
  selector: 'clark-privileges-list',
  templateUrl: './privileges-list.component.html',
  styleUrls: ['./privileges-list.component.scss'],
  animations: privilegesListAnimations
})
export class PrivilegesListComponent implements OnInit {
  @Input() privileges: string[][] = [];
  @Input() collections: { [index: string]: string } = {};

  @Output() delete: EventEmitter<number> = new EventEmitter();

  // deletion is immediate from the UI; no confirmation mode required

  constructor() {}

  ngOnInit() {}

  /**
   * Remove the privilege at the specified index
   *
   * @param {number} index
   * @memberof PrivilegesListComponent
   */
  /**
   * Emit delete event for the given index immediately (no confirmation UI)
   */
  remove(index: number) {
    this.delete.emit(index);
  }

  /**
   * Instructs the ngFor how to track changes to the list of privileges
   *
   * @param {*} _
   * @param {*} item
   * @returns
   * @memberof PrivilegesListComponent
   */
  trackBy(_, item) {
    return item.join('@');
  }
}
