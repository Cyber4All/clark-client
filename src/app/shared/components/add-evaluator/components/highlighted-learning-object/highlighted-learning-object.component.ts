import { Component, Input, OnInit } from '@angular/core';
import { LearningObject } from '@entity';
import { NgClass, NgIf, SlicePipe, TitleCasePipe } from '@angular/common';
import { TipDirective } from '../../../../directives/tip.directive';

@Component({
    selector: 'clark-highlighted-learning-object',
    templateUrl: './highlighted-learning-object.component.html',
    styleUrls: ['./highlighted-learning-object.component.scss'],
    standalone: true,
    imports: [NgClass, TipDirective, NgIf, SlicePipe, TitleCasePipe]
})
export class HighlightedLearningObjectComponent implements OnInit {

  @Input() learningObject: LearningObject;
  @Input() statusDescription;

  constructor() { }

  ngOnInit(): void {
  }

}
