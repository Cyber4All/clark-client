import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { LearningObject } from '@entity';
import { BehaviorSubject, Subject } from 'rxjs';
import { trigger, style, animate, transition } from '@angular/animations';
import { UriRetrieverService } from 'app/core/uri-retriever.service';
import { take, takeUntil, filter } from 'rxjs/operators';
import { Router, NavigationStart } from '@angular/router';


@Component({
  selector: 'clark-side-panel-content',
  templateUrl: './side-panel-content.component.html',
  styleUrls: ['./side-panel-content.component.scss'],
  animations: [
   trigger('revision', [
    transition(':enter', [
      style({ opacity: 0}),
      animate('200ms 600ms ease-out', style({ 'opacity': 1})),
      ]),
    ]),
  trigger('madeRevision', [
    transition(':leave', [
      style({ opacity: 1 }),
      animate('400ms ease-out', style({ transform: 'translateY(100px)', opacity: 0 })),
    ]),
  ])
  ]
})
export class SidePanelContentComponent implements OnChanges, OnDestroy {
  private isDestroyed$ = new Subject<void>();

  @Input() learningObject: LearningObject;

  releasedLearningObject: LearningObject;
  revisionLearningObject: LearningObject;

  ratings: any[];
  averageRating: number;
  meatballOpen: boolean;

  loadingObject: boolean;
  loadingRevision: boolean;

  // Output for context menu option to submit revision for review
  @Output()
  submit: EventEmitter<void> = new EventEmitter();

  @Output() createRevision: EventEmitter<LearningObject> = new EventEmitter();
  hasRevision: boolean;

  constructor(
    private uriRetrieverService: UriRetrieverService,
    private el: ElementRef,
    private router: Router
  ) {
    // listen for navigation events and close the side panel
    this.router.events.pipe(
      takeUntil(this.isDestroyed$),
      filter(event => event instanceof NavigationStart)
    ).subscribe(() => {
      this.close();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.learningObject) {
      this.hasRevision = this.learningObject.hasRevision;

      this.loadingObject = true;
      this.uriRetrieverService.getLearningObject({
        author: this.learningObject.author.username,
        cuidInfo: {
          cuid: this.learningObject.cuid,
          version: this.learningObject.revision,
        },
      }, ['metrics', 'ratings']).pipe(
        take(1),
      ).subscribe(object => {
        this.releasedLearningObject = object;
      }, _ => { }, () => {
        this.loadingRevision = false;
      });

      this.loadingObject = false;
      this.loadingRevision = true;

      this.uriRetrieverService.getLearningObject({
        author: this.learningObject.author.username,
        cuidInfo: {
          cuid: this.learningObject.cuid,
          version: this.learningObject.revision + 1,
        },
      }, ['metrics', 'ratings']).pipe(
        take(1)
      ).subscribe(object => {
        this.revisionLearningObject = object;
      }, _ => { }, () => {
        this.loadingRevision = false;
      });
    }
  }

  close() {
    this.el.nativeElement.dispatchEvent(new Event('SidePanelCloseEvent', { bubbles: false }));
  }

  ngOnDestroy() {
    this.isDestroyed$.next();
    this.isDestroyed$.unsubscribe();
  }
}
