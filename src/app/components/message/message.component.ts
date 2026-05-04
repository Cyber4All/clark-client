import { Component, Input, OnInit } from '@angular/core';
import { Downtime } from 'app/core/utility-module/utility.service';

import { SafeHtmlPipe } from '../safe-html.pipe';

@Component({
    selector: 'clark-message',
    templateUrl: './message.component.html',
    styleUrls: ['./message.component.scss'],
    standalone: true,
    imports: [SafeHtmlPipe]
})
export class MessageComponent implements OnInit {

  @Input() showBanner = false;
  @Input() downtime: Downtime;

  constructor() { }

  ngOnInit() {
  }

}
