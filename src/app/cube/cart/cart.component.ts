import { Router } from '@angular/router';
import { CartV2Service } from '../../core/cartv2.service';
import { Component, OnInit } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';
import { LearningObjectService } from '../learning-object.service';
import { Observable } from 'rxjs/Observable';
import { environment } from '@env/environment';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'cube-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems: LearningObject[] = [];
  canDownload = true;
  downloading = false;

  constructor(
    public cartService: CartV2Service,
    private learningObjectService: LearningObjectService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCart();
    // FIXME: Hotfix for whitlisting. Remove if functionallity is extended or removed
    if (environment.production) {
      // this.checkWhitelist();
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

  downloadObject(event, object) {
    event.stopPropagation();

    try {
      const author = object._author._username;
      const learningObjectName = object._name;
      this.downloading = true;
      this.cartService.downloadLearningObject(author, learningObjectName);
      this.downloading = false;
    } catch (e) {
      console.log(e);
    }
  }

  goToItem(object) {
    this.router.navigate(['/details/', object._author._username, object._name]);
  }

  // FIXME: Hotfix for whitlisting. Remove if functionallity is extended or removed
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
