import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { slide, fade } from './side-panel-viewer.component.animations';

@Component({
  selector: 'clark-side-panel-viewer',
  template: `
    <ng-container *ngIf="value">
      <div (click)="close()" [@fade] class="overlay"></div>
      <div
        [style.minWidth]="contentWidth + 'px'"
        (click)="$event.stopPropagation()"
        [@slide]="{
          value: ':enter',
          params: {
            pixels: contentWidth + 40,
            outSpeed: outSpeed,
            inSpeed: inSpeed
          }
        }"
        class="side-panel"
      >
        <ng-content></ng-content>
      </div>
    </ng-container>
  `,
  styleUrls: ['./side-panel-viewer.component.scss'],
  animations: [slide, fade]
})
export class SidePanelViewerComponent implements OnInit, OnDestroy {
  _watcher$: BehaviorSubject<boolean>;
  contentWidth = 400;

  value: boolean;
  private defaultWidth = 350;
  private destroyed$: Subject<void> = new Subject();

  constructor() {}

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
    this._watcher$.pipe(takeUntil(this.destroyed$)).subscribe(val => {
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
