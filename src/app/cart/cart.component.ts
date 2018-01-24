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
    private cartService: CartService,
    private learningObjectService: LearningObjectService
  ) { }

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.cartService.cart$.subscribe((library) => {
      if (library.items.length > 0) {
        // TODO: Convert return type to Observable
        this.learningObjectService.getLearningObjectsByIDs(library.items)
          .then((learningObjects) => {
            this.cartItems = learningObjects;
          });
      } else {
        this.cartItems = [];
      }
    });
  }

  async download() {
    let ids = await this.cartService.getLearningObjects();
    console.log(ids);
    this.cartService.checkout(ids);
  }

  saveBundle() {

  }

  clearCart() {
    this.cartService.clearCart();
    this.cartService.clearCart();
  }

  removeItem(id) {
    this.cartService.removeLearningObject(id);
  }

}
