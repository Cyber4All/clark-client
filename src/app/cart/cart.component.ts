import { Component, OnInit } from '@angular/core';
import { CartService } from '../shared/services/cart.service';
import { LearningObject } from 'clark-entity';
import { LearningObjectService } from '../learning-object.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  cartItems: LearningObject[];

  constructor(
    private cartService: CartService,
    private learningObjectService: LearningObjectService
  ) { }

  ngOnInit() {
    this.loadCart();
  }

  async loadCart() {
    const learningObjectIDs: string[] = await this.cartService.getLearningObjects();
    if (learningObjectIDs.length > 0) {
      this.cartItems = await this.learningObjectService.getLearningObjectsByIDs(learningObjectIDs);
    }
    console.log(this.cartItems);
  }

  download() {

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
