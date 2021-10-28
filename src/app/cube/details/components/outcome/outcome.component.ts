import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { LearningOutcome } from '@entity';
import { trigger, transition, style, animate, query, animateChild, stagger } from '@angular/animations';

@Component({
  selector: 'clark-outcome',
  templateUrl: './outcome.component.html',
  styleUrls: ['./outcome.component.scss'],
  animations: [
    trigger('showOutcome', [
      transition(':enter', [
        style({ opacity: 0, height: 0 }),
        animate('200ms ease', style({ opacity: 1, height: '*' })),
        query('@*', stagger(90, animateChild()))
      ]),
      transition(':leave', [
        style({ opacity: 1, height: '*', }),
        animate('200ms ease', style({ opacity: 0, height: 0 }))
      ])
    ]),
    trigger('outcome', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate('160ms ease', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class OutcomeComponent implements OnInit {

  @Input() outcome: LearningOutcome;

  mappingsFrameworks = [];

  outcomeText: string;

  showMappings = false;

  ngOnInit() {
    // Capitalize the outcome verb
    if (this.outcome.outcome) {
      this.outcomeText = this.outcome.outcome.charAt(0).toUpperCase().concat(this.outcome.outcome.slice(1));
    }
    // Get the unique framework names for the outcomes mappings
    this.mappingsFrameworks = this.outcome.mappings.filter(
      (v, i, mappings) =>
        mappings.findIndex(guidelines => (guidelines.frameworkName === v.frameworkName)) === i
      );
  }

  toggleMappingsDisplay() {
    this.showMappings = !this.showMappings;
  }

}
