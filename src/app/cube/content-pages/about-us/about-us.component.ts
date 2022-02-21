import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { sections } from './copy';

@Component({
  selector: 'clark-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutClarkComponent implements OnInit {

  constructor() { }

  ngOnInit(): void { }

  title = 'About Us';

  get tabs() {
    return Object.values(sections);
  }
}
