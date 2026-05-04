import { Component, OnInit } from '@angular/core';
import {default as events} from '../../../../../assets/events.json';


@Component({
    selector: 'clark-timeline',
    templateUrl: './timeline.component.html',
    styleUrls: ['./timeline.component.scss'],
    standalone: true,
    imports: []
})
export class TimelineComponent implements OnInit {

  events = events;

  constructor() {
  }
  ngOnInit() {
  }
}
