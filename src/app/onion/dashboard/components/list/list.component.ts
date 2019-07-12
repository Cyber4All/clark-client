import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { LearningObject } from '@entity';

@Component({
  selector: 'clark-dashboard-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent {
  @Input() showOptions: boolean;
  @Input() learningObjects: LearningObject[];
  @Input() title: string;

}
