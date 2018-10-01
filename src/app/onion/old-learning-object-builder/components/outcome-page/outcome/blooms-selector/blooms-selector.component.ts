import { Component, EventEmitter, OnInit, ElementRef, Output, Input, OnChanges } from '@angular/core';
import { levels } from '@cyber4all/clark-taxonomy';

@Component({
  selector: 'onion-blooms-selector',
  templateUrl: 'blooms-selector.component.html',
  styleUrls: ['blooms-selector.component.scss']
})

export class BloomsSelectorComponent implements OnInit, OnChanges {
  @Input() default;
  @Output('bloom') bloom = new EventEmitter<string>();
  bloomValue;

  constructor(private el: ElementRef) { }

  ngOnInit() {
    this.bloomValue = this.default;
  }

  ngOnChanges() {
    this.bloomValue = this.default;
  }

  get levels(): Array<string> {
    return Array.from(levels);
  }

  toggleActiveSquare(event) {
    const e = this.el.nativeElement.querySelectorAll('.outcome_bloom .square.active');
    for (let i = 0; i < e.length; i++) { e[i].classList.remove('active'); }
    event.currentTarget.classList.add('active');
    this.bloomValue = event.currentTarget.attributes.data.value;
    this.bloom.next(this.bloomValue);
  }
}
