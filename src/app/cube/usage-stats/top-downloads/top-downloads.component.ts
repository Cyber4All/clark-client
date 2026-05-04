import { Component, OnInit, Input } from '@angular/core';
import { LearningObject } from 'entity/learning-object/learning-object';
import { NgClass, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'clark-top-downloads',
    templateUrl: './top-downloads.component.html',
    styleUrls: ['./top-downloads.component.scss'],
    standalone: true,
    imports: [NgClass, RouterLink, TitleCasePipe]
})
export class TopDownloadsComponent implements OnInit {
  @Input() learningObjects: LearningObject[];
  @Input() loading: boolean;
  constructor() { }

  ngOnInit(): void {
  }

}
