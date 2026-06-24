import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivateDirective } from '../../../directives/activate.directive';

@Component({
    selector: 'clark-revision-notice-popup',
    templateUrl: './revision-notice-popup.component.html',
    styleUrls: ['./revision-notice-popup.component.scss'],
    standalone: true,
    imports: [ActivateDirective]
})
export class RevisionNoticePopupComponent implements OnInit {

  @Output() close: EventEmitter<void> = new EventEmitter();
  @Output() createRevision: EventEmitter<void> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

}
