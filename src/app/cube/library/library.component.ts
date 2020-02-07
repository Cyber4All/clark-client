import { Component, OnInit, OnDestroy } from '@angular/core';
import { CartV2Service } from 'app/core/cartv2.service';
import { LearningObject } from 'entity/learning-object/learning-object';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from 'app/core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'clark-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit, OnDestroy{

  loading: boolean;
  serviceError: boolean;
  cartItems: LearningObject[] = [];
  downloading = [];
  destroyed$ = new Subject<void>();
  canDownload = false;

  constructor(
    public cartService: CartV2Service,
    private toaster: ToastrOvenService,
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.loadCart();
  }

  async loadCart() {
    try {
      this.loading = true;
      this.cartItems = await this.cartService.getCart(1, 10);
      console.log(this.cartItems);
      this.loading = false;
    } catch (e) {
      this.toaster.error('Error!', 'Unable to load your library. Please try again later.');
      this.serviceError = true;
      this.loading = false;
    }
  }

  async removeItem(event: MouseEvent, object: LearningObject) {
    event.stopPropagation();
    try {
      this.cartItems = await this.cartService.removeFromCart(object.cuid);
    } catch (e) {
      console.log(e);
    }
  }

  downloadObject(event: MouseEvent, object: LearningObject, index: number) {
    console.log(event);
    event.stopPropagation();
    this.downloading[index] = true;
    this.cartService.downloadLearningObject(
        object.author.username,
        object.cuid,
        object.version
      ).pipe(
      takeUntil(this.destroyed$))
      .subscribe(finished => {
        if (finished) {
          this.downloading[index] = false;
        }
      });
  }

  goToItem(object: LearningObject) {
    this.router.navigate(['/details/', object.author.username, object.cuid]);
  }

  private async checkAccessGroup() {
    this.canDownload = this.authService.hasReviewerAccess();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

}
