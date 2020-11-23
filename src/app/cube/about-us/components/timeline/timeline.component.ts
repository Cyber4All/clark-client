import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'clark-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit {

  events = [
    {
      "id": 1,
      "date": "Temporary Date",
      "description": "this will be description of an event that happened durring the duration of clark",
      "image": "../../../../../assets/images/collections/gencyber.png"
    },
    {
      "id": 2,
      "date": "Temporary Date 2",
      "description": "this will be description of an event that happened durring the duration of clark",
      "image": "../../../../../assets/images/collections/c5.png"
    },
    {
      "id": 3,
      "date": "Temporary Date 3",
      "description": "this will be description of an event that happened durring the duration of clark"
    }
  ]

  constructor() { 
  }
  ngOnInit() {
  }
}

/**
 * TO_DO
 * 
 * 3. Is storing an array of json objs in this component fine since 
 *    only this component needs that? My thought was it would be redundant
 *    to create another file and create functions to acess it when it could just be here locally.
 *    What are others thoughts?
 
 * 5. The background has is not White (#ffffff) it is a blueish grey is this ok?
 *  
 */