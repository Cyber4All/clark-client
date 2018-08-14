import { CartV2Service, iframeParentID } from '../../core/cartv2.service';
import { LearningObjectService } from '../learning-object.service';
import { LearningObject } from '@cyber4all/clark-entity';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { environment } from '@env/environment';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import { NotificationService } from '../../shared/notifications/notification.service';
import { UserService } from '../../core/user.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'cube-learning-object-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit, OnDestroy {

  private subs: Subscription[] = [];
  author: string;
  learningObjectName: string;
  learningObject: LearningObject;
  returnUrl: string;
  url: string;

  iframeParent = iframeParentID;

  public tips = TOOLTIP_TEXT;

  constructor(
    private learningObjectService: LearningObjectService,
    public userService: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.subs.push(this.route.params.subscribe(params => {
      this.author = params['username'];
      this.learningObjectName = params['learningObjectName'];
      this.fetchLearningObject();
    }));

    this.returnUrl =
      '/browse/details/' +
      this.route.snapshot.params['username'] +
      '/' +
      this.route.snapshot.params['learningObjectName'];
  }

  async fetchLearningObject() {
    try {
      this.learningObject = await this.learningObjectService.getLearningObject(
        this.author,
        this.learningObjectName
      );
    } catch (e) {
      console.log(e);
    }
  }

  /*
  async clearCart() {
    try {
      await this.cartService.clearCart();
    } catch (e) {
      console.log(e);
    }
  }*/

  ngOnDestroy() {
    for (const sub of this.subs) {
      sub.unsubscribe();
    }
  }
}
