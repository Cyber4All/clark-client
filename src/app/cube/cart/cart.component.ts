import { Router } from '@angular/router';
import { CartV2Service } from '../../core/cartv2.service';
import { Component, OnInit } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';
import { LearningObjectService } from '../learning-object.service';
import { Observable } from 'rxjs/Observable';
import { environment } from '@env/environment';

@Component({
  selector: 'cube-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems: LearningObject[] = [];

  constructor(
    public cartService: CartV2Service,
    private learningObjectService: LearningObjectService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  async loadCart() {
    try {
      this.cartItems = await this.cartService.getCart();

      // FIXME: Hotfix for whitlisting. Remove if functionallity is extended or removed
      if (environment.production) {
        this.checkWhitelist();
      }
    } catch (e) {
      console.log(e);
    }
  }

  async download() {
    this.cartService.checkout();
  }

  saveBundle() {}

  async clearCart() {
    if (await this.cartService.clearCart()) {
      this.cartItems = [];
    } else {
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
    } catch (e) {}
  }

  async downloadObject(event, object) {
    event.stopPropagation();
    const author = object._author._username;
    const learningObjectName = object._name;
    await this.cartService.downloadLearningObject(author, learningObjectName);
  }

  goToItem(object) {
    this.router.navigate(['/details/', object._author._username, object._name]);
  }

  // FIXME: Hotfix for whitlisting. Remove if functionallity is extended or removed
  private async checkWhitelist() {
    try {
      const response = await fetch(environment.whiteListURL);
      const object = await response.json();
      const whitelist = object.whitelist;
      this.cartItems.map(lo => {
        if (whitelist.includes(lo.author.username)) {
          lo.canDownload = true;
        }
        return lo;
      });
    } catch (e) {
      console.log(e);
    }
  }
}
