import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'clark-header-502-info',
  templateUrl: './header-info.component.html',
  styleUrls: ['./header-info.component.scss']
})
export class HeaderInfo502Component implements OnInit {

  @Output() about: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  navigate(){
    this.about.emit();
  }

}
