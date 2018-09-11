import { Router } from '@angular/router';
import { CartV2Service, iframeParentID } from '../../core/cartv2.service';
import { Component, OnInit } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';
import { LearningObjectService } from '../learning-object.service';
import { environment } from '@env/environment';
import { AuthService } from '../../core/auth.service';
import { Subscription } from 'rxjs';
import { COPY } from './cart.copy';

@Component({
  selector: 'cube-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  copy = COPY;
  private subscriptions: Subscription[] = [];
  cartItems: LearningObject[] = [];
  downloading = [];
  iframeParent = iframeParentID;
  canDownload = false;

  constructor(
    public cartService: CartV2Service,
    private learningObjectService: LearningObjectService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCart();
    // FIXME: Hotfix for white listing. Remove if functionality is extended or removed
    if (environment.production) {
      this.checkWhitelist();
    } else {
      this.canDownload = true;
    }
  }

  async loadCart() {
    try {
      this.cartItems = await this.cartService.getCart();
    } catch (e) {
      console.log(e);
    }
  }

  async clearCart() {
    if (await this.cartService.clearCart()) {
      this.cartItems = [];
    }
  }

  async removeItem(event, object) {
    event.stopPropagation();
    const author = object.author.username;
    const learningObjectName = object.name;
    try {
      this.cartItems = await this.cartService.removeFromCart(
        author,
        learningObjectName
      );
    } catch (e) {
      console.log(e);
    }
  }

  downloadObject(event, object: LearningObject, index: number) {
    event.stopPropagation();
    this.downloading[index] = true;
    const loaded = this.cartService.downloadLearningObject(
      object.author.username,
      object.name
    );
    this.subscriptions.push(
      loaded.subscribe(finished => {
        if (finished) {
          this.downloading[index] = false;
        }
      })
    );
  }

  goToItem(object) {
    this.router.navigate(['/details/', object._author._username, object._name]);
  }

  // FIXME: Hotfix for white listing. Remove if functionality is extended or removed
  private async checkWhitelist() {
    try {
      const response = await fetch(environment.whiteListURL);
      const object = await response.json();
      const whitelist: string[] = object.whitelist;
      const username = this.authService.username;
      if (whitelist.includes(username)) {
        this.canDownload = true;
      }
    } catch (e) {
      console.log(e);
    }
  }
}
