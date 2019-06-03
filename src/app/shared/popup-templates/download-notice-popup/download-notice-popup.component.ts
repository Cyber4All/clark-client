import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UserAgentService } from 'app/core/user-agent.service';

@Component({
  selector: 'clark-download-notice-popup',
  templateUrl: './download-notice-popup.component.html',
  styleUrls: ['./download-notice-popup.component.scss']
})
export class DownloadNoticePopupComponent implements OnInit {

  @Output() close: EventEmitter<void> = new EventEmitter();

  constructor(public UAService: UserAgentService) { }

  ngOnInit() {
  }

}
