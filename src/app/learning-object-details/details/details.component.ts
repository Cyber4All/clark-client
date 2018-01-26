import { CartV2Service } from './../../shared/services/cartv2.service';
import { ModalService } from '@cyber4all/clark-modal';
import { LearningObjectService } from './../../learning-object.service';
import { LearningObject } from '@cyber4all/clark-entity';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../shared/services/cart.service';

@Component({
  selector: 'learning-object-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy {

  private sub: any;
  author: string;
  learningObjectName: string;
  learningObject: LearningObject;

  constructor(
    private learningObjectService: LearningObjectService,
    private cartService: CartV2Service,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.author = params['username'];
      this.learningObjectName = params['learningObjectName'];
    });
    this.fetchLearningObject();
  }
  async fetchLearningObject() {
    this.learningObject = await this.learningObjectService.getLearningObject(this.author, this.learningObjectName);
  }

  async addToCart() {
    let val = await this.cartService.addToCart(this.author, this.learningObjectName);
  }
  async clearCart() {
    if (await this.cartService.clearCart()) {
    } else {
      console.log('not logged in!');
    }
  }
  removeFromCart() {
    this.cartService.removeFromCart(this.author, this.learningObjectName);
  }
  reportThisObject() {
    alert('test');
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
