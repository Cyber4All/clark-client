import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'clark-input-field',
  templateUrl: './input-field.component.html',
  styleUrls: ['./input-field.component.scss']
})
export class InputFieldComponent implements OnInit {
  @Input() phold: String = '';
  @Input() pw: Boolean = false;
  @Input() error: Boolean = false;
  @Input() errMessage: String = '';
  hide: Boolean;
  constructor() { }

  ngOnInit(): void {
    this.hide = this.pw;
  }

}
