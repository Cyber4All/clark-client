import { Component, EventEmitter, Output, Input } from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  animateChild,
  sequence
} from '@angular/animations';

@Component({
  selector: 'clark-popup-viewer',
  styleUrls: ['popup-viewer.component.scss'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('100ms', style({ opacity: 1 })),
        query('@scale', animateChild())
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('100ms', style({ opacity: 0 })),
        query('@scale', animateChild())
      ])
    ]),
    trigger('scale', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        sequence([
          animate(
            '100ms 70ms ease-out',
            style({ transform: 'scale(1)', opacity: 1 })
          ),
          query('@*', animateChild(), { optional: true })
        ])
      ]),
      transition(':leave', [
        style({ transform: 'scale(1)', opacity: 1 }),
        animate(
          '100ms ease-out',
          style({ transform: 'scale(0.8)', opacity: 0 })
        )
      ])
    ])
  ],
  template: `
    <div [@fade] class="overlay" [ngClass]="{'overlay--floating': floating}" (click)="close.emit()">
      <div [@scale] (click)="$event.stopPropagation()">
        <div class="popup-close" (click)="close.emit()">
          <i class="far fa-times"></i>
        </div>
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class PopupViewerComponent {
  @Input() floating: boolean;
  @Output() close: EventEmitter<void> = new EventEmitter();
}
