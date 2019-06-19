import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations'
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'clark-side-panel-viewer',
  template: `
  <ng-container *ngIf="value">
    <div (click)="close()" [@fade] class="overlay"></div>
    <div [style.minWidth]="contentWidth + 'px'" (click)="$event.stopPropagation()" [@slide]="{value: ':enter', params: { pixels: contentWidth + 40, outSpeed: outSpeed, inSpeed: inSpeed }}" class="side-panel">
      <ng-content></ng-content>
    </div>
  </ng-container>
  `,
  styleUrls: ['./side-panel-viewer.component.scss'],
  animations: [
    trigger('slide', [
      transition(':enter', [
        style({ transform: 'translateX({{ pixels }}px)', opacity: 1 }),
        animate('{{ outSpeed }}ms 150ms ease', style({ transform: 'translateX(0px)', opacity: 1 }))
      ], { params : { pixels: 400, outSpeed: 350, inSpeed: 250 } }),
      transition(':leave', [
        style({ transform: 'translateX(0px)', opacity: 1 }),
        animate('{{ inSpeed }}ms ease', style({ transform: 'translateX({{ pixels }}px)', opacity: 1 }))
      ], { params : { pixels: 400, outSpeed: 350, inSpeed: 250 } }),
    ]),
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('250ms ease', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('250ms ease', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class SidePanelViewerComponent implements OnDestroy, OnInit {

  _watcher$: BehaviorSubject<boolean>;
  contentWidth = 400;

  value: boolean;
  private defaultWidth = 350;
  private destroyed$: Subject<void> = new Subject();

  constructor() { }

  /**
   * Calculate the speed necessary to open te side panel
   *
   * @readonly
   * @memberof SidePanelViewerComponent
   */
  get outSpeed() {
    return 350 + (this.contentWidth - this.defaultWidth) * 0.3;
  }

  /**
   * Calculate the speed necessary to close the side panel
   *
   * @readonly
   * @memberof SidePanelViewerComponent
   */
  get inSpeed() {
    return 250 + (this.contentWidth - this.defaultWidth) * 0.3;
  }

  ngOnInit() {
    this._watcher$.pipe(
      takeUntil(this.destroyed$)
    ).subscribe(val => {
      this.value = val;
    });
  }

  /**
   * Signals the side panel to close
   *
   * @memberof SidePanelViewerComponent
   */
  close() {
    this._watcher$.next(false);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

}
