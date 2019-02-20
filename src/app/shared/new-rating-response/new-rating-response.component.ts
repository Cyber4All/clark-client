import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'clark-new-rating-response',
  templateUrl: './new-rating-response.component.html',
  styleUrls: ['./new-rating-response.component.scss']
})

export class NewRatingResponseComponent implements OnInit {

  @Input() index: number;
  @Output() cancel: EventEmitter<number> = new EventEmitter();
  @Output() submit: EventEmitter<{comment: string, index: number}> = new EventEmitter();

  response = {
    comment: '',
    index: 0,
  };

  ngOnInit() { }

  submitResponse() {
    this.response.index = this.index;
    this.submit.emit(this.response);
  }

  cancelResponse() {
    this.cancel.emit(this.index);
  }
}
