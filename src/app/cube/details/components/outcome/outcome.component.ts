import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { LearningOutcome } from '@entity';

@Component({
  selector: 'clark-outcome',
  templateUrl: './outcome.component.html',
  styleUrls: ['./outcome.component.scss']
})
export class OutcomeComponent {

  @Input() outcome: LearningOutcome;

  showMappings = false;

  toggleMappingsDisplay() {
    this.showMappings = !this.showMappings;
  }
}
