import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'clark-academic-level-card',
  templateUrl: './academic-level-card.component.html',
  styleUrls: ['./academic-level-card.component.scss']
})

export class AcademicLevelCardComponent {
  @Input() category: string;
  @Input() academicLevels: { [name: string]: boolean };
}
