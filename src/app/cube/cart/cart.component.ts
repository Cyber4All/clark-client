
import {takeUntil} from 'rxjs/operators';
import { Router } from '@angular/router';
import { CartV2Service, iframeParentID } from '../../core/cartv2.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { LearningObject } from '@entity';
import { AuthService } from '../../core/auth.service';
import { Subject } from 'rxjs';
import { COPY } from './cart.copy';
import { ToasterService } from 'app/shared/modules/toaster';

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

  loading: boolean;
  serviceError: boolean;

  statuses = LearningObject.Status;

  constructor(
    public cartService: CartV2Service,
    private router: Router,
    private authService: AuthService,
    private toaster: ToasterService,
  ) { }

  ngOnInit() {
    this.loadCart();
    // TODO: This should check on an object by object basis if the user has download access
    this.checkAccessGroup();
  }

  async loadCart() {
    try {
      this.loading = true;
      this.cartItems = await this.cartService.getCart();
      this.loading = false;
    } catch (e) {
      this.toaster.notify('Error!', 'Unable to load your library. Please try again later.', 'bad', 'far fa-times');
      this.serviceError = true;
      this.loading = false;
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
        object.name,
        object.hasRevision
      ).pipe(
      takeUntil(this.destroyed$))
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
    this.canDownload = this.authService.hasReviewerAccess();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
