import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'clark-new-rating-response',
  templateUrl: './new-rating-response.component.html',
  styleUrls: ['./new-rating-response.component.scss']
})

export class NewRatingResponseComponent implements OnInit {

  @Input() response: {comment: string, index: number};
  @Input() editing = false;
  @Output() cancel: EventEmitter<number> = new EventEmitter();
  @Output() submit: EventEmitter<{comment: string, index: number}> = new EventEmitter();

  ngOnInit() { }

  submitResponse() {
    this.submit.emit(this.response);
  }

  cancelResponse() {
    this.cancel.emit(this.response.index);
  }
}
