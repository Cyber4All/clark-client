import { Component, OnInit, OnDestroy } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';
import { LearningObjectService } from '../../../core/learning-object.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { TimeFunctions } from '../time-functions';
import 'rxjs/add/operator/switchMap';


@Component({
  selector: 'neutrino-view',
  templateUrl: './view.component.html',
  styleUrls: ['../../styles.css', './view.component.scss']
})
export class ViewComponent implements OnInit, OnDestroy {

  learningObjectName: string;
  routeParamSub: any;

  TimeFunctions: TimeFunctions = new TimeFunctions();

  learningObject: LearningObject;

  constructor(private lobjectService: LearningObjectService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.getRouteParams();
    this.learningObjectName ? this.fetchLearningObject() :
      'No ID provided in route, redirect somewhere';
  }

  getRouteParams() {
    this.routeParamSub = this.route.params.subscribe((params) => {
      this.learningObjectName = params['learningObjectName'];
    });
  }

  fetchLearningObject() {
    this.lobjectService.getLearningObject(this.learningObjectName).then(
      (learningObject) => {
        console.log(learningObject);
        learningObject ? this.learningObject = learningObject : 'Error fetching LearningObject';
      }
    ).catch(
      (error) => {
        console.log(error);
        alert('Invalid Learning Object.');
      }
    )
  }

  ngOnDestroy() {
    this.routeParamSub.unsubscribe();
  }

}
