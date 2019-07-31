import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'clark-revision-notice-popup',
  templateUrl: './revision-notice-popup.component.html',
  styleUrls: ['./revision-notice-popup.component.scss']
})
export class RevisionNoticePopupComponent implements OnInit {

  @Output() close: EventEmitter<void> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  createRevision(): void {
      
  }

}
