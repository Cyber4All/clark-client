import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'clark-reviewer-panel',
  templateUrl: './reviewer-panel.component.html',
  styleUrls: ['./reviewer-panel.component.scss']
})
export class ReviewerPanelComponent implements OnInit {
  @Input() releasedDate;
  @Input() revisedDate;
  @Output() download: EventEmitter<boolean> = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }
  downloadRevisions(download: boolean) {
    this.download.emit(download);
  }
}
