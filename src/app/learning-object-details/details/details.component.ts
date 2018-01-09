import { LearningObjectService } from './../../learning-object.service';
import { LearningObject } from 'clark-entity';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'learning-object-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit, OnDestroy {
  /*learningObject = {
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
  };*/

  private sub: any;
  id: string;
  learningObject: any;

  constructor(public service: LearningObjectService, private route: ActivatedRoute) { }
  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.id = params['id'];
    });
    this.fetchLearningObject();
  }
  async fetchLearningObject() {
    this.learningObject = await this.service.getLearningObject(this.id);
    console.log(this.learningObject);
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
