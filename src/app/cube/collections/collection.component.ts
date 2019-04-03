import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CollectionService } from 'app/core/collection.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'cube-collection',
  templateUrl: 'collection.component.html',
  styleUrls: ['collection.component.scss']
})
export class CollectionComponent implements OnInit, OnDestroy {
  destroyed$ = new Subject<void>();
  key = new Subject<string>();
  collection;
  pictureLocation: string;

  constructor(
    private route: ActivatedRoute,
    private collectionService: CollectionService
  ) { }

  ngOnInit() {
    this.route.params
      .pipe(
        takeUntil(this.destroyed$)
      )
      .subscribe(params => {
        this.fetchCollection(params.name);
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

  async fetchCollection(name: string) {
    this.collection = await this.collectionService.getCollectionMetadata(name);
    this.key.next(this.collection.abvName);
    if (this.collection.abvName !== 'intro_to_cyber' && this.collection.abvName !== 'secure_coding_community') {
      this.pictureLocation = '../../../assets/images/collections/' + this.collection.abvName + '.png';
    }
  }
}
