import { Router } from '@angular/router';
import { CartV2Service, iframeParentID } from '../../core/cartv2.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';
import { AuthService } from '../../core/auth.service';
import { Subject } from 'rxjs';
import { COPY } from './cart.copy';

@Component({
  selector: 'cube-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  copy = COPY;
  destroyed$ = new Subject<void>();
  cartItems: LearningObject[] = [];
  downloading = [];
  iframeParent = iframeParentID;
  canDownload = false;

  constructor(
    public cartService: CartV2Service,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loadCart();
    // TODO: This should check on an object by object basis if the user has download access
    this.checkAccessGroup();
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

  async removeItem(event: MouseEvent, object: LearningObject) {
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

  downloadObject(event: MouseEvent, object: LearningObject, index: number) {
    event.stopPropagation();
    this.downloading[index] = true;
    this.cartService.downloadLearningObject(
        object.author.username,
        object.name
      )
      .takeUntil(this.destroyed$)
      .subscribe(finished => {
        if (finished) {
          this.downloading[index] = false;
        }
      });
  }

  goToItem(object: LearningObject) {
    this.router.navigate(['/details/', object.author.username, object.name]);
  }

  private async checkAccessGroup() {
    this.canDownload = this.authService.hasPrivelagedAccess();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
