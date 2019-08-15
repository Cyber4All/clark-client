import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'clark-toggle-switch',
  templateUrl: './toggle-switch.component.html',
  styleUrls: ['./toggle-switch.component.scss']
})
export class ToggleSwitchComponent implements OnInit {
  @Input() state: boolean;
  @Output() toggled: EventEmitter<boolean> = new EventEmitter();
  @Input() aria: string;
  @Input() identity: string;
  @Input() style: 'blue' | 'orange' = 'blue';
  constructor() { }

  ngOnInit() {
  }

  toggle() {
    this.state = !this.state;
    this.toggled.emit(this.state);
  }
}
