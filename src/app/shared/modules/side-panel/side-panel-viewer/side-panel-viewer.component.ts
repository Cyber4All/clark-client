import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SidePanelOptions } from '../panel.directive';
import { fade } from '../panel.animations';

@Component({
  selector: 'clark-side-panel-viewer',
  template: `
    <ng-container>
      <div *ngIf="isOpen" (activate)="doClose()" [@fade] class="overlay"></div>
      <div
        [style.width]="contentWidth + 'px'"
        (activate)="$event.stopPropagation()"
        class="side-panel" [ngClass]="{'side-panel--no-padding': options && !options.padding}"
      >
        <button
          *ngIf="options.showExit"
          class="side-panel__exit-button"
          [style.color]="options.exitButtonColor"
          (activate)='doClose()'
          ><i class="fal fa-times"></i>
        </button>
        <ng-content></ng-content>
      </div>
    </ng-container>
  `,
  styleUrls: ['./side-panel-viewer.component.scss'],
  animations: [fade]
})
export class SidePanelViewerComponent implements OnInit, OnDestroy {
  _controller$: BehaviorSubject<boolean>;
  contentWidth = 400;

  options: SidePanelOptions;

  isOpen = true;

  @Output() close = new EventEmitter<any>();
  defaultCloseParam: any;

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

  doClose() {
    if (this.defaultCloseParam) {
      this.close.emit(this.defaultCloseParam);
    } else {
      this.close.emit();
    }
  }

  ngOnInit() {
    this.close.pipe(
      takeUntil(this.destroyed$)
    ).subscribe(() => {
      this.isOpen = false;
    })
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
