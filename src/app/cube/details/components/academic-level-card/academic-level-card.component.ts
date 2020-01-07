import { Component, Input } from '@angular/core';

@Component({
  selector: 'clark-academic-level-card',
  templateUrl: './academic-level-card.component.html',
  styleUrls: ['./academic-level-card.component.scss']
})

export class AcademicLevelCardComponent {
  @Input() category: string;
  @Input() academicLevels: { [name: string]: boolean };

  getSortedLevels(): string[] {
    const sortedLevels = Object.keys(this.academicLevels);
    return sortedLevels;
  }
}
