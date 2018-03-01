import { Router } from '@angular/router';
import { CartV2Service } from '../cube-core/services/cartv2.service';
import { Component, OnInit } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';
import { LearningObjectService } from '../learning-object.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  cartItems: LearningObject[] = [];

  constructor(
    public cartService: CartV2Service,
    private learningObjectService: LearningObjectService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadCart();
  }

  async loadCart() {
    const val = await this.cartService.getCart();
    if (val) {
      this.cartItems = <Array<LearningObject>>val;
      console.log(this.cartItems);
    } else {
      console.log('not logged in!');
    }
  }

  async download() {
    this.cartService.checkout();
  }

  saveBundle() {

  }

  async clearCart() {
    if (await this.cartService.clearCart()) {
      this.cartItems = [];
    } else {
      console.log('not logged in!');
    }
  }

  async removeItem(event, object) {
    event.stopPropagation();
    const author = object._author._username;
    const learningObjectName = object._name;
    const val = await this.cartService.removeFromCart(author, learningObjectName);
    if (val) {
      this.cartItems = <Array<LearningObject>>val;
    } else {
      console.log('not logged in!');
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
