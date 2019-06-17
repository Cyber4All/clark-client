import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { first } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'clark-privileges-list',
  templateUrl: './privileges-list.component.html',
  styleUrls: ['./privileges-list.component.scss'],
  animations: [
    trigger('privilege', [
      transition('* => *', [
        query(':leave', [
          style({ opacity: 1, transform: 'scale(1, 1)', height: '*' }),
          animate('200ms ease', style({ opacity: 0, transform: 'scale(1, 0)', height: 0 }))
        ], { optional: true }),
        query(':enter', [
          style({ opacity: 0, transform: 'scale(1, 0)', height: 0 }),
          stagger('50ms', [
            animate('200ms ease', style({ opacity: 1, transform: 'scale(1, 1)', height: '*' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('deleteConfirm', [
      transition(':enter', [
        style({ opacity: 0 }),
        query('div', [
          style({ opacity: 0, transform: 'translateX(100px)' })
        ]),
        animate('200ms ease', style({ opacity: 1 })),
        query('div', [
          stagger('50ms', [
            animate('150ms ease', style({ opacity: 1, transform: 'translateX(0px)' }))
          ])
        ])
      ]),
      transition(':leave', [
        style({ opacity: 1  }),
        query('div', [
          style({ opacity: 1, transform: 'translateX(0px)' }),
          stagger('50ms', [
            animate('150ms ease', style({ opacity: 0, transform: 'translateX(20px)' }))
          ])
        ]),
        animate('200ms ease', style({ opacity: 0 }))
      ])
    ])
  ]
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
