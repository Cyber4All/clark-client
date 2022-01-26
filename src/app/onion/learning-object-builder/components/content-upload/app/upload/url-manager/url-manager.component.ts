
import {takeUntil, debounceTime} from 'rxjs/operators';
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy
} from '@angular/core';
import { Subject } from 'rxjs';


import { LearningObject } from '@entity';


@Component({
  selector: 'clark-url-manager',
  templateUrl: './url-manager.component.html',
  styleUrls: ['./url-manager.component.scss']
})
export class UrlManagerComponent implements OnInit, OnDestroy {
  @Input()
  urls: LearningObject.Material.Url[] = [];

  @Output()
  add: EventEmitter<void> = new EventEmitter();
  @Output()
  update: EventEmitter<{ index: number; url: LearningObject.Material.Url }> = new EventEmitter();
  @Output()
  remove: EventEmitter<number> = new EventEmitter();
  @Output()
  save: EventEmitter<void> = new EventEmitter();


  triggerSave$ = new Subject();
  componentDestroyed$ = new Subject();

  urlUpdated$: Subject<{
    index: number;
    title: string;
    url: string;
  }> = new Subject();

  addNew: boolean;
  focusMe: boolean;
  constructor() {}

  ngOnInit() {
    // listen for events on the triggerSave subject and, after 650ms of no events, emit an event to the parent component
    this.triggerSave$.pipe(
      takeUntil(this.componentDestroyed$),
      debounceTime(650), )
      .subscribe(() => {
        this.save.emit();
      });

    this.subToUrlUpdates();

    this.addNew = true;
  }

  /**
   * Opens subscriptions to updates pushed to Url object. Sets properties that are not undefined and emits update
   *
   * @private
   * @memberof UrlManagerComponent
   */
  private subToUrlUpdates() {
    this.urlUpdated$.pipe(
      takeUntil(this.componentDestroyed$),
      debounceTime(650), )
      .subscribe(update => {
        const url = this.urls[update.index];
        if (update.title !== undefined) {
          url.title = update.title;
        }
        if (update.url !== undefined) {
          url.url = update.url;
        }
        this.update.emit({ url, index: update.index });
      });
  }
  /**
   * Emits an event to the parent component and fires next on the trigger save subject
   */
  addURL() {
    this.add.emit();
    this.addNew = false;
    this.focusMe = true;
  }


  /**
   * Function that emits an event when the user enters in both the
   * title and url field
   *
   * @param event
   */
  updateUrl(event: object) {
    this.focusMe = event['focusMe'];
    if (event['addNew'] === true) {
      this.addNew = true;
      const index: number = event['index'];
      const url:   string = event['url'];
      const title: string = event['title'];
      this.urlUpdated$.next({index, url, title });
    } else {
      this.addNew = false;
    }
  }

  /**
   * Emit's an event to parent component containing the index of the url to be removed
   * and fires next() on the trigger save subject
   *
   * @param index
   */
  removeURL(index: number) {
    this.remove.emit(index);
    if (index === this.urls.length) {
      this.addNew = true;
    }
    this.triggerSave$.next();
  }

  ngOnDestroy() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }
}
