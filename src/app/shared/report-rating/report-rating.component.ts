import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'clark-report-rating',
  templateUrl: './report-rating.component.html',
  styleUrls: ['./report-rating.component.scss']
})
export class ReportRatingComponent implements OnInit {
  @Input() subject = 'rating';
  @Output() submit: EventEmitter<{concern: string, comment?: string}> = new EventEmitter();

  types = [
    'It\'s inapropriate',
    'It\'s spam',
    'Other'
  ];

  page = 1;
  type: number;
  comment = '';

  constructor() { }

  ngOnInit() {
  }

  selectType(index: number) {
    this.type = index;
    this.page = 2;
  }

  triggerReport() {
    const payload: any = { concern: this.types[this.type] };

    if (this.comment) {
      payload.comment = this.comment;
    }

    this.submit.emit(payload);

  }

}
