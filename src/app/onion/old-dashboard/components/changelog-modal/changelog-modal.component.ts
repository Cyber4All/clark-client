import { Component, OnInit, Input } from '@angular/core';
import { LearningObject } from '@entity';

@Component({
  selector: 'clark-changelog-modal',
  templateUrl: './changelog-modal.component.html',
  styleUrls: ['./changelog-modal.component.scss'],
})
export class ChangelogModalComponent implements OnInit {

  @Input() learningObject: LearningObject;
  @Input() changelogs: any;
  @Input() loading: boolean;

  constructor() { }

  ngOnInit() {
  }

}
