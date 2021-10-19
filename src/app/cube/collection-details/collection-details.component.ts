import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CollectionService } from '../../core/collection.service';
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
  ) {}

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
    this.collection = await this.collectionService.getCollectionMetadata(abvName);
    this.key.next(this.collection.abvName);
    if (
      this.collection.abvName !== 'intro_to_cyber'
      && this.collection.abvName !== 'secure_coding_community'
      && this.collection.abvName !== 'plan c'
      && this.collection.abvName !== '502_project'
    ) {
      this.pictureLocation = '../../../assets/images/collections/' + this.collection.abvName + '.png';
    }
    if (this.collection.abvName === 'plan c') {
      this.showContribute = true;
    }
    this.titleService.setTitle(this.collection.name + ' | CLARK');
  }
}
