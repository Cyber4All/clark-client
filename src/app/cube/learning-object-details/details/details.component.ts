import { CartV2Service, iframeParentID } from '../../../core/cartv2.service';
import { LearningObjectService } from './../../learning-object.service';
import { LearningObject } from '@cyber4all/clark-entity';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { environment } from '@env/environment';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import { UserService } from '../../../core/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'cube-learning-object-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  downloading = false;
  addingToLibrary = false;
  author: string;
  learningObjectName: string;
  learningObject: LearningObject;
  returnUrl: string;
  saved = false;

  contributorsList = [];

  canDownload = true;
  iframeParent = iframeParentID;

  public tips = TOOLTIP_TEXT;

  constructor(
    private learningObjectService: LearningObjectService,
    private cartService: CartV2Service,
    public userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.route.params.subscribe(params => {
        this.author = params['username'];
        this.learningObjectName = params['learningObjectName'];
      })
    );
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
      if (this.learningObject.contributors) {
        // The array of contributors attached to the learning object contains a
        // list of usernames. We want to display their full names.
        this.getContributors();
      }
    } catch (e) {
      console.log(e);
    }
    this.saved = this.cartService.has(this.learningObject);
  }

  async addToCart(download?: boolean) {
    if (!download) {
      // we don't want the add to library button spinner on the 'download' action
      this.addingToLibrary = true;
    } else {
      this.downloading = true;
    }
    const val = await this.cartService.addToCart(
      this.author,
      this.learningObjectName
    );
    this.saved = this.cartService.has(this.learningObject);
    this.addingToLibrary = false;
    if (download) {
      try {
        this.download(
          this.learningObject.author.username,
          this.learningObject.name
        );
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

  download(author: string, learningObjectName: string) {
    this.downloading = true;
    const loaded = this.cartService.downloadLearningObject(
      author,
      learningObjectName
    );
    this.subscriptions.push(
      loaded.subscribe(finished => {
        if (finished) {
          this.downloading = false;
        }
      })
    );
  }

  removeFromCart() {
    this.cartService.removeFromCart(this.author, this.learningObjectName);
  }

  private getContributors() {
    for (let i = 0; i < this.learningObject.contributors.length; i++) {
      this.userService
        .getUser(this.learningObject.contributors[i])
        .then(val => {
          this.contributorsList[i] = val;
        });
    }
  }

  ngOnDestroy() {
    for (const sub of this.subscriptions) {
      sub.unsubscribe();
    }
  }
}
