import { Component, OnInit } from '@angular/core';
import { COPY } from '../../home.copy';

@Component({
  selector: 'clark-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  copy = COPY;

  constructor() { }

  ngOnInit() {
  }

}
