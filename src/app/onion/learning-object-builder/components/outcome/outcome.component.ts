import { Component, OnInit } from '@angular/core';
import { levels } from '@cyber4all/clark-taxonomy';

@Component({
  selector: 'clark-outcome',
  templateUrl: './outcome.component.html',
  styleUrls: ['./outcome.component.scss']
})
export class OutcomeComponent implements OnInit {
  outcomeLevels = Array.from(levels.values());

  constructor() { }

  ngOnInit() {
  }

}
