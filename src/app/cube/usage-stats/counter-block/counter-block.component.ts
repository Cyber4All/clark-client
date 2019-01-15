import { Component, OnInit, Input } from '@angular/core';

export interface CounterStat {
  title: string;
  value: number;
}

@Component({
  selector: 'cube-counter-block',
  templateUrl: 'counter-block.component.html',
  styleUrls: ['counter-block.component.scss']
})
export class CounterBlockComponent implements OnInit {
  @Input() stat: CounterStat;
  constructor() {}

  ngOnInit() {}
}
