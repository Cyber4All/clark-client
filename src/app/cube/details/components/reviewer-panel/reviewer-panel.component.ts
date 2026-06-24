import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivateDirective } from '../../../../shared/directives/activate.directive';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'clark-reviewer-panel',
    templateUrl: './reviewer-panel.component.html',
    styleUrls: ['./reviewer-panel.component.scss'],
    standalone: true,
    imports: [ActivateDirective, DatePipe]
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
