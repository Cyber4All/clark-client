import { Component, OnInit, Input } from '@angular/core';
import { NgClass, DecimalPipe } from '@angular/common';

export interface CounterStat {
  title: string;
  value: number;
  class?: string;
}

@Component({
    selector: 'cube-counter-block',
    templateUrl: 'counter-block.component.html',
    styleUrls: ['counter-block.component.scss'],
    standalone: true,
    imports: [NgClass, DecimalPipe]
})
export class CounterBlockComponent implements OnInit {
  @Input() stat: CounterStat;
  constructor() {}

  ngOnInit() {}
}
