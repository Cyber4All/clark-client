import { Component, OnInit } from '@angular/core';
import { content } from './about_copy';

@Component({
  selector: 'clark-502-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class About502Component implements OnInit {
  content = content;

  constructor() { }

  ngOnInit(): void { }
}
