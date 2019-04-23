import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'clark-identification-pill',
  templateUrl: './identification-pill.component.html',
  styleUrls: ['./identification-pill.component.scss']
})
export class IdentificationPillComponent implements OnInit {
  @Input() accessGroup: string;

  constructor() { }

  ngOnInit() {
  }

}
