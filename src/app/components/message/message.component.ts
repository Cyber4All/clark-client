import { Component, Input, OnInit } from '@angular/core';
import { Downtime } from 'app/core/utility-module/messages.service';

@Component({
  selector: 'clark-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {

  @Input() showBanner = false;
  @Input() downtime: Downtime;

  constructor() { }

  ngOnInit() {
  }

}
