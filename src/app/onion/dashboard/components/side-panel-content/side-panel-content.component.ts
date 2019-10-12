import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { LearningObject } from '@entity';
import { Subject } from 'rxjs';
import { UriRetrieverService } from 'app/core/uri-retriever.service';
import { take, takeUntil, filter } from 'rxjs/operators';
import { Router, NavigationStart } from '@angular/router';
import { translateDown, sidePanelEnter, buttonWipeRight } from './side-panel-content.animations';


@Component({
  selector: 'clark-side-panel-content',
  templateUrl: './side-panel-content.component.html',
  styleUrls: ['./side-panel-content.component.scss'],
  animations: [ translateDown, sidePanelEnter, buttonWipeRight ]
})
export class SidePanelContentComponent implements OnChanges, OnDestroy {
  private isDestroyed$ = new Subject<void>();

  @Input() learningObject: LearningObject;
  @Input() activePromise: Promise<any>;

  promiseResolver = new Subject<Promise<any>>();

  releasedLearningObject: LearningObject;
  revisionLearningObject: LearningObject;

  ratings: any[];
  averageRating: number;
  meatballOpen: boolean;

  loadingObject: boolean;
  loadingRevision: boolean;

  hasRevision: boolean;

  loadingText: string;

  @Output() createRevision: EventEmitter<LearningObject> = new EventEmitter();
  @Output() submitRevision: EventEmitter<LearningObject> = new EventEmitter();
  @Output() cancelRevisionSubmission: EventEmitter<LearningObject> = new EventEmitter();
  @Output() deleteRevision: EventEmitter<LearningObject> = new EventEmitter();

  constructor(
    private uriRetrieverService: UriRetrieverService,
    private el: ElementRef,
    private router: Router
  ) {
    // listen for navigation events and close the side panel
    this.router.events.pipe(
      takeUntil(this.isDestroyed$),
      take(1),
      filter(event => event instanceof NavigationStart)
    ).subscribe(() => {
      this.close(false);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.learningObject) {
      this.fetchReleasedLearningObject();
      this.fetchRevisionLearningObject();
    } else if (changes.activePromise) {
      this.promiseResolver.next(changes.activePromise.currentValue);
    }
  }

  fetchReleasedLearningObject() {
    this.loadingObject = true;
    this.fetchLearningObject(
      this.learningObject.author.username,
      this.learningObject.cuid,
      this.learningObject.version
    ).then(object => {
      this.releasedLearningObject = object;
    }).finally(() => {
      this.loadingObject = false;
    });
  }

  fetchRevisionLearningObject() {
    this.loadingRevision = true;
    this.fetchLearningObject(
      this.learningObject.author.username,
      this.learningObject.cuid,
      this.learningObject.version + 1
    ).then(object => {
      this.revisionLearningObject = object;
      this.hasRevision = true;
    }).catch(_ => {
      this.hasRevision = false;
    }).finally(() => {
      this.loadingRevision = false;
    });
  }

  fetchLearningObject(username: string, cuid: string, version: number): Promise<LearningObject> {
    return new Promise((resolve, reject) => {
      this.uriRetrieverService.getLearningObject({
        author: username,
        cuidInfo: { cuid, version},
      }, ['metrics', 'ratings']).pipe(
        take(1),
      ).subscribe(object => {
        resolve(object);
      }, err => {
        reject(err);
      });
    });
  }

  // EVENT HANDLERS
  createRevisionHandler() {
    this.loadingRevision = true;
    this.createRevision.emit(this.releasedLearningObject);
    this.promiseResolver.pipe(
      take(1)
    ).subscribe(promise => {
      promise.then(() => {
        this.fetchRevisionLearningObject();
      }).catch(() => {
        this.loadingRevision = false;
      });
    });
  }

  submitRevisionHandler() {
    this.submitRevision.emit(this.revisionLearningObject);
    this.promiseResolver.pipe(
      take(1)
    ).subscribe(promise => {
      promise.then(() => {
        this.fetchRevisionLearningObject();
      });
    });
  }

  cancelSubmissionHandler() {
    this.cancelRevisionSubmission.emit(this.revisionLearningObject);
    this.promiseResolver.pipe(
      take(1)
    ).subscribe(promise => {
      promise.then(() => {
        this.fetchRevisionLearningObject();
      });
    });
  }

  deleteRevisionHandler() {
    this.loadingRevision = true;
    this.deleteRevision.emit(this.revisionLearningObject);
    this.promiseResolver.pipe(
      take(1)
    ).subscribe(promise => {
      promise.then(() => {
        this.revisionLearningObject = undefined;
        this.hasRevision = false;
      }).finally(() => {
        this.loadingRevision = false;
      });
    });
  }

  close(shouldRoute: boolean = true) {
    this.el.nativeElement.dispatchEvent(new CustomEvent('SidePanelCloseEvent', { bubbles: false, detail: { shouldRoute: shouldRoute } }));
  }

  ngOnDestroy() {
    this.isDestroyed$.next();
    this.isDestroyed$.unsubscribe();
  }
}
