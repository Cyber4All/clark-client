import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'clark-learning-outcomes',
  templateUrl: './learning-outcomes.component.html',
  styleUrls: ['./learning-outcomes.component.scss']
})
export class LearningOutcomesComponent implements OnInit {

  bloomCards = [{
    icon: 'fal fa-cloud fa-3x',
    text: 'Remember & Understand',
    flipped: false,
    clicked: false,
    description: `Recalling relevant knowledge from long term memory and making sense of the knowledge that you have gained.`
  }, {
    icon: 'fal fa-bolt fa-3x',
    text: 'Apply & Analyze',
    flipped: false,
    clicked: false,
    description: `Using knowledge that you have gained and understanding how various pieces of knowledge are related.`
  }, {
    icon: 'fal fa-balance-scale-right fa-3x',
    text: 'Evaluate and Synthesize',
    flipped: false,
    clicked: false,
    description: `Making decisions based on known guidelines and creating something original.`
  }];

  constructor() { }

  ngOnInit(): void {
  }
}
