import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { LearningOutcome } from '@entity';
import { trigger, transition, style, animate, query, animateChild, stagger } from '@angular/animations';
import { stringify } from 'querystring';

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

  outcomeText: string;

  showMappings = false;

  ngOnInit() {
    // Capitilize the outcome verb
    if (this.outcome.outcome) {
      this.outcomeText = this.outcome.outcome.charAt(0).toUpperCase().concat(this.outcome.outcome.slice(1));
    }
  }

  toggleMappingsDisplay() {
    this.showMappings = !this.showMappings;
  }

}
