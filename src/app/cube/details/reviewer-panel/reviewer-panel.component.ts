import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';

@Component({
  selector: 'clark-reviewer-panel',
  templateUrl: './reviewer-panel.component.html',
  styleUrls: ['./reviewer-panel.component.scss']
})
export class ReviewerPanelComponent implements OnInit {
  @Input() learningObject: LearningObject;
  @Output() download: EventEmitter<boolean> = new EventEmitter();
  constructor(
  ) { }

  ngOnInit() {
  }

  toggleDownloadModal(download: boolean) {
    this.download.emit(download);
  }
}
