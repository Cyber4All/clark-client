import { CartV2Service } from './../shared/services/cartv2.service';
import { Component, OnInit } from '@angular/core';
import { CartService } from '../shared/services/cart.service';
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
    private cartService: CartV2Service,
    private learningObjectService: LearningObjectService
  ) { }

  ngOnInit() {
    this.loadCart();
  }

  async loadCart() {
    // this.cartService.cart$.subscribe((library) => {
    //   if (library.items.length > 0) {
    //     // TODO: Convert return type to Observable
    //     this.learningObjectService.getLearningObjectsByIDs(library.items)
    //       .then((learningObjects) => {
    //         this.cartItems = learningObjects;
    //       });
    //   } else {
    //     this.cartItems = [];
    //   }
    // });
    this.cartItems = await this.cartService.getCart();
  }

  async download() {
    this.cartService.checkout();
  }

  saveBundle() {

  }

  clearCart() {
    this.cartService.clearCart();
  }

  async removeItem(author: string, learningObjectName: string) {
    this.cartItems = await this.cartService.removeFromCart(author, learningObjectName);
  }

}
