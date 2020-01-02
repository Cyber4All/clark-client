import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'clark-academic-level-card',
  templateUrl: './academic-level-card.component.html',
  styleUrls: ['./academic-level-card.component.scss']
})

<<<<<<< HEAD
export class AcademicLevelCardComponent implements OnInit {
  @Input() category: string;
  @Input() academicLevels: { [name: string]: boolean };

  constructor() {}

  ngOnInit() {
  }

=======
export class AcademicLevelCardComponent {
  @Input() category: string;
  @Input() academicLevels: { [name: string]: boolean };
>>>>>>> 2abfb640fa717203a1597a9708b2f4de1ffa0f9a
}
