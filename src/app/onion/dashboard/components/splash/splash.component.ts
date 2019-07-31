import { Component, EventEmitter, Output } from '@angular/core';
import { trigger, transition, style, animate, animateChild, query } from '@angular/animations';

@Component({
  selector: 'clark-dashboard-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss'],
  animations: [
    trigger('splash', [
      transition(':enter', [
        style({transform: 'scale(0,1)', opacity: 0}),
        animate('400ms ease-out', style({ transform: 'scale(1)', opacity: 1})),
        query( '@search', animateChild() )
      ])
    ]),
    trigger('search', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0}),
        animate('300ms 200ms ease-out', style({ transform: 'translateY(0px)', opacity: 1})),
      ])
    ]),
  ]
})
export class SplashComponent {

  @Output() navigateBack: EventEmitter<void> = new EventEmitter();
  @Output() searchText: EventEmitter<string> = new EventEmitter();

  emitSearch(text: string) {
    this.searchText.emit(text);
  }
}
