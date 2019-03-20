import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'clark-version-switch',
  templateUrl: './version-switch.component.html',
  styleUrls: ['./version-switch.component.scss']
})
export class VersionSwitchComponent implements OnInit {
  @Input() state: boolean;
  @Input() hasRevisions: boolean;
  @Output() toggled: EventEmitter<boolean> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  toggle() {
    this.state = !this.state;
    this.toggled.emit(this.state);
  }
}
