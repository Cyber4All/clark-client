import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionService } from '../../core/collection-module/collections.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';

// This component sets its own page title
@Component({
  selector: 'cube-collection-details',
  templateUrl: 'collection-details.component.html',
  styleUrls: ['collection-details.component.scss']
})
export class CollectionDetailsComponent implements OnInit, OnDestroy {
  destroyed$ = new Subject<void>();
  key = new Subject<string>();
  collection;
  pictureLocation: string;
  showContribute = false;

  COPY = {
    VIEWALL: 'View All'
  };

  constructor(
    private route: ActivatedRoute,
    private collectionService: CollectionService,
    private titleService: Title,
    private router: Router,
  ) { }

  ngOnInit() {
    this.route.params
      .pipe(
        takeUntil(this.destroyed$)
      )
      .subscribe(params => {
        this.fetchCollection(params.abvName);
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

  async fetchCollection(abvName: string) {
    this.collection = await this.collectionService.getCollectionMetadata(abvName).catch(e => {
      if (e.status === 404) {
        this.router.navigate(['not-found']);
      }
    });
    this.key.next(this.collection.abvName);

    this.pictureLocation = '../../../assets/images/collections/' + this.collection.abvName + '.png';

    if (this.collection.abvName === 'plan c') {
      this.showContribute = true;
    }
    this.titleService.setTitle('CLARK | ' + this.collection.name);
  }

  /**
   * If a picture is not found, the picture location is reset to null
   * This will load the default image
   */
  resetPictureLocation() {
    this.pictureLocation = null;
  }
}
