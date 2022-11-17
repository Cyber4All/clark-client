import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'clark-learning-outcomes',
  templateUrl: './learning-outcomes.component.html',
  styleUrls: ['./learning-outcomes.component.scss'],
  animations: [
    trigger('flipState', [
      state('active', style({
        transform: 'rotateY(179deg)'
      })),
      state('inactive', style({
        transform: 'rotateY(0)'
      })),
      transition('active => inactive', animate('500ms ease-out')),
      transition('inactive => active', animate('500ms ease-in'))
    ])
  ]
})
export class LearningOutcomesComponent implements OnInit {

  bloomCards = [{
    icon: 'fal fa-cloud fa-3x',
    text: 'Remember & Understand',
    flipped: 'inactive',
    description: `Recalling relevant knowledge from long term memory and making sense of the knowledge that you have gained.`
  }, {
    icon: 'fal fa-bolt fa-3x',
    text: 'Apply & Analyze',
    flipped: 'inactive',
    description: `Using knowledge that you have gained and understanding how various pieces of knowledge are related.`
  }, {
    icon: 'fal fa-balance-scale-right fa-3x',
    text: 'Evaluate and Synthesize',
    flipped: 'inactive',
    description: `Making decisions based on known guidelines and creating something original.`
  }];

  constructor() { }

  ngOnInit(): void {
  }

  toggleFlip(card: any, state: string) {
    card.flipped = state;
  }
}
