import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'clark-learning-outcomes',
  templateUrl: './learning-outcomes.component.html',
  styleUrls: ['./learning-outcomes.component.scss']
})
export class LearningOutcomesComponent implements OnInit {

  bloomCards = [{
    icon: 'fal fa-cloud',
    text: 'Remember & Understand',
    description: `1. Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
    Morbi tincidunt ornare massa eget. Ut tellus elementum sagittis vitae et.`
  }, {
    icon: 'fal fa-bolt',
    text: 'Apply & Analyze',
    description: `2. Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
    Morbi tincidunt ornare massa eget. Ut tellus elementum sagittis vitae et.`
  }, {
    icon: 'fal fa-balance-scale-right',
    text: 'Evaluate and Synthesize',
    description: `3. Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
    Morbi tincidunt ornare massa eget. Ut tellus elementum sagittis vitae et.`
  }];

  constructor() { }

  ngOnInit(): void {
  }

}
