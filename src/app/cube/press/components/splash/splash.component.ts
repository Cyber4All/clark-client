import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'clark-press-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements OnInit {
  @Output() downloadPressKit: EventEmitter<void> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

}
