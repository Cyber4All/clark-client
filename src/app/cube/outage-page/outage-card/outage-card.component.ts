import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'clark-outage-card',
  templateUrl: './outage-card.component.html',
  styleUrls: ['./outage-card.component.scss']
})
export class OutageCardComponent implements OnInit {

  @Input() status;

  constructor() { }

  ngOnInit() {
  }

}
