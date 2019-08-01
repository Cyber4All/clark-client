import { Component, OnInit, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'clark-edit-notice-popup',
  templateUrl: './edit-notice-popup.component.html',
  styleUrls: ['./edit-notice-popup.component.scss']
})
export class EditNoticePopupComponent implements OnInit {
  @Output() close: EventEmitter<void> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

}
