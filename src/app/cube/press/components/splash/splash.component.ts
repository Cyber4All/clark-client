import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivateDirective } from '../../../../shared/directives/activate.directive';

@Component({
    selector: 'clark-press-splash',
    templateUrl: './splash.component.html',
    styleUrls: ['./splash.component.scss'],
    standalone: true,
    imports: [ActivateDirective]
})
export class SplashComponent implements OnInit {
  @Output() viewPressKit: EventEmitter<void> = new EventEmitter();
  @Output() viewLogo: EventEmitter<void> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

}
