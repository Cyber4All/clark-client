import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UserAgentService } from 'app/core/client-module/user-agent.service';

import { ActivateDirective } from '../../../directives/activate.directive';

@Component({
    selector: 'clark-download-notice-popup',
    templateUrl: './download-notice-popup.component.html',
    styleUrls: ['./download-notice-popup.component.scss'],
    standalone: true,
    imports: [ActivateDirective]
})
export class DownloadNoticePopupComponent implements OnInit {

  @Output() close: EventEmitter<void> = new EventEmitter();

  // eslint-disable-next-line @typescript-eslint/naming-convention
  constructor(public UAService: UserAgentService) { }

  ngOnInit() {
  }

}
