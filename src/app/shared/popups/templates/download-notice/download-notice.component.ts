import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UserAgentService } from 'app/core/user-agent.service';

@Component({
  selector: 'clark-download-notice',
  templateUrl: './download-notice.component.html',
  styleUrls: ['./download-notice.component.scss']
})
export class DownloadNoticeComponent implements OnInit {

  @Output() close: EventEmitter<void> = new EventEmitter();

  constructor(public UAService: UserAgentService) { }

  ngOnInit() {
  }

}
