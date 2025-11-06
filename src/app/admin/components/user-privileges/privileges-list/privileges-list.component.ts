import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { privilegesListAnimations } from './privileges-list.component.animations';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';

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

  deleteMode: number;
  deleteConfirmation$: Subject<boolean> = new Subject();

  constructor() {}

  ngOnInit() {}

  /**
   * Remove the privilege at the specified index
   *
   * @param {number} index
   * @memberof PrivilegesListComponent
   */

  async remove(index: number) {
    this.deleteMode = index;
    const confirmation = await this.deleteConfirmation$.pipe(first()).toPromise();

    if (confirmation) {
      this.delete.emit(index);
    }
    this.deleteMode = undefined;
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
