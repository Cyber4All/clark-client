import { LearningObject } from 'clark-entity';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'learning-object-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {
  learningObject = {
    name: 'Sample Nano',
    author: 'thowar4',
    length: 'Nanomodule',
    date: new Date(1515468567593).toLocaleDateString(),
    goals: [{ text: 'goal1' }, { text: 'goal2' }],
    outcomes: [{ bloom: 'Apply and analyze', verb: 'Analyze', text: 'Integer error', 
                assessments: [{
                  plan: 'Case', text: '<img src="https://www.w3schools.com/howto/img_fjords.jpg"/>'}],
                instructions: [{
                  instruction: 'Quiz', text: '<ol><li>Option</li></ol>'}]
              },
            {
              bloom: 'Apply and analyze', verb: 'Analyze', text: 'Integer error',
              assessments: [{
                plan: 'Case', text: '<img src="https://www.w3schools.com/howto/img_fjords.jpg"/>'
              }],
              instructions: [{
                instruction: 'Quiz', text: '<ol><li>Option</li></ol>'
              }]
      }],

  };

  constructor() {
    
  }

  ngOnInit() {
    
  }

}
