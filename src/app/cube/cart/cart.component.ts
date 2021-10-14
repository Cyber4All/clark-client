
import {takeUntil} from 'rxjs/operators';
import { Router } from '@angular/router';
import { LibraryService, iframeParentID } from '../../core/library.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { LearningObject } from '@entity';
import { AuthService } from '../../core/auth.service';
import { Subject } from 'rxjs';
import { COPY } from './cart.copy';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';

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
    public libraryService: LibraryService,
    private router: Router,
    private authService: AuthService,
    private toaster: ToastrOvenService,
  ) { }

  ngOnInit() {
    this.loadLibrary();
    // TODO: This should check on an object by object basis if the user has download access
    this.checkAccessGroup();
  }

  async loadLibrary() {
    try {
      this.loading = true;
      this.cartItems = (await this.libraryService.getLibrary()).cartItems;
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
      await this.libraryService.removeFromLibrary(object.cuid);
      this.cartItems = (await this.libraryService.getLibrary()).cartItems;
    } catch (e) {
      console.log(e);
    }
  }

  downloadObject(event: MouseEvent, object: LearningObject, index: number) {
    event.stopPropagation();
    this.downloading[index] = true;
    this.libraryService.downloadLearningObject(
        object.author.username,
        object.id
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
