import { LearningObjectService } from './../learning-object.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-academics',
  templateUrl: './academics.component.html',
  styleUrls: ['./academics.component.scss']
})
export class AcademicsComponent implements OnInit {

  groups;

  constructor(public service: LearningObjectService) {
    service.observeFiltered().subscribe(groups => {
      this.groups = this.sort(groups);
    });
  }

  ngOnInit() {
  }

  sort(groups) {
    const sorted = [];
    /*for (const g of groups) {
      for (const o of g.learningObjects) {
        if (o.institutionLevel) {
          sorted.push(o);
        }
      }
    }*/
    sorted.push({title: 'K-12', learningObjects: [{ topic: 'SPLASH', class: 'Course', url: 'http://cis1.towson.edu/~cyber4all/index.php/splash_home/' }]});
    sorted.push({title: 'Undergraduate', learningObjects: [{ topic: 'Cybersecurity for Future Presidents', class: 'Course' }]});
    
    return sorted;
  }
}
