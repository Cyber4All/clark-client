import { iframeParentID } from '../../core/cartv2.service';
import { LearningObjectService } from '../learning-object.service';
import { LearningObject } from '@cyber4all/clark-entity';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../core/user.service';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'cube-learning-object-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit, OnDestroy {

  private isDestroyed$ = new Subject<void>();
  learningObject: LearningObject;
  returnUrl: string;

  // This is used by the cart service to target the iframe in this component when the action-panel download function is triggered
  iframeParent = iframeParentID;

  constructor(
    private learningObjectService: LearningObjectService,
    public userService: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params
      .takeUntil(this.isDestroyed$)
      .subscribe(params => {
        this.fetchLearningObject(params['username'], params['learningObjectName']);
      });

    this.returnUrl =
      '/browse/details/' +
      this.route.snapshot.params['username'] +
      '/' +
      this.route.snapshot.params['learningObjectName'];
  }

  async fetchLearningObject(author: string, name: string) {
    try {
      this.learningObject = await this.learningObjectService.getLearningObject(
        author,
        name
      );
    } catch (e) {
      console.log(e);
    }
  }

  ngOnDestroy() {
    this.isDestroyed$.next();
    this.isDestroyed$.unsubscribe();
  }
}
