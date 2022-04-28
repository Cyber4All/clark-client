import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'clark-502-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class Header502Component implements OnInit {
  @Output() about: EventEmitter<any> = new EventEmitter()
  constructor() { }

  ngOnInit(): void {
  }

  navigate(event: any) {
    this.about.emit();
  }

}
