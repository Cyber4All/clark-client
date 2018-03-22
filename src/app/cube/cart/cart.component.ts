import { Router } from '@angular/router';
import { CartV2Service } from '../../core/cartv2.service';
import { Component, OnInit } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';
import { LearningObjectService } from '../learning-object.service';
import { Observable } from 'rxjs/Observable';

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
    } catch (e) {
      
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
    } catch (e) {
      
    }
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
}
