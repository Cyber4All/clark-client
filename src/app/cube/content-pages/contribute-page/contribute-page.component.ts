import { Component, OnInit } from '@angular/core';
import { sections } from './copy';

@Component({
  selector: 'clark-contribute-page',
  templateUrl: './contribute-page.component.html',
  styleUrls: ['./contribute-page.component.scss']
})

export class ContributePageComponent implements OnInit {
  contributors: {
    name: string;
    description: string;
    subsections?: Array<{}>;
  } [] = [
  ];

  constructor() { }

  ngOnInit(): void {
  }

  title = 'Contribute';
   copy = sections;

   get tabs() {
     return Object.values(this.copy);
    }
}
