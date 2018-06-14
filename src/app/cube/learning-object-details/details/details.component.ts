import { CartV2Service } from '../../../core/cartv2.service';
import { ModalService } from '../../../shared/modals';
import { LearningObjectService } from './../../learning-object.service';
import { LearningObject } from '@cyber4all/clark-entity';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  ActivatedRouteSnapshot
} from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { LearningGoal } from '@cyber4all/clark-entity/dist/learning-goal';
import { AuthService } from '../../../core/auth.service';
import { NgClass } from '@angular/common';
import { environment } from '@env/environment';
import { TOOLTIP_TEXT } from '@env/tooltip-text';

@Component({
  selector: 'cube-learning-object-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy {
  private sub: any;
  downloading = false;
  author: string;
  learningObjectName: string;
  learningObject: LearningObject;
  returnUrl: string;
  saved = false;

  canDownload = true;

  public tips = TOOLTIP_TEXT;

  constructor(
    private learningObjectService: LearningObjectService,
    private cartService: CartV2Service,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.author = params['username'];
      this.learningObjectName = params['learningObjectName'];
    });

    this.fetchLearningObject();

    // FIXME: Hotfix for white listing. Remove if functionality is extended or removed
    if (environment.production) {
      // this.checkWhitelist();
    } else {
      this.canDownload = true;
    }

    this.returnUrl =
      '/browse/details/' +
      this.route.snapshot.params['username'] +
      '/' +
      this.route.snapshot.params['learningObjectName'];
  }

  // FIXME: Hotfix for whitlisting. Remove if functionallity is extended or removed
  private async checkWhitelist() {
    try {
      const response = await fetch(environment.whiteListURL);
      const object = await response.json();
      const whitelist: string[] = object.whitelist;
      const username = this.auth.username;
      if (whitelist.includes(username)) {
        this.canDownload = true;
      }
    } catch (e) {
      console.log(e);
    }
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
    this.saved = this.cartService.has(this.learningObject);
  }

  async addToCart(download?: boolean) {
    this.downloading = true;
    const val = await this.cartService.addToCart(
      this.author,
      this.learningObjectName
    );
    this.saved = this.cartService.has(this.learningObject);
    if (download) {
      try {
        await this.download(this.author, this.learningObjectName);
      } catch (e) {
        console.log(e);
      }
    }
  }

  async clearCart() {
    try {
      await this.cartService.clearCart();
    } catch (e) {
      console.log(e);
    }
  }

  async download(author: string, learningObjectName: string) {
    try {
      await this.cartService.downloadLearningObject(author, learningObjectName);
      this.downloading = false;
    } catch (e) {
      console.log(e);
    }
  }

  removeFromCart() {
    this.cartService.removeFromCart(this.author, this.learningObjectName);
  }

  reportThisObject() {}

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
