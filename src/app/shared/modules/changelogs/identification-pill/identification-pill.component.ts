import { Component, OnInit, Input } from '@angular/core';
import { NgClass, TitleCasePipe } from '@angular/common';

@Component({
    selector: 'clark-identification-pill',
    templateUrl: './identification-pill.component.html',
    styleUrls: ['./identification-pill.component.scss'],
    standalone: true,
    imports: [NgClass, TitleCasePipe]
})
export class IdentificationPillComponent implements OnInit {
  @Input() accessGroup: string;
  @Input() theme = 'default';

  constructor() { }

  ngOnInit() {
  }

}
