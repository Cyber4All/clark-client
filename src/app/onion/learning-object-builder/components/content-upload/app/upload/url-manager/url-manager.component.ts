import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy
} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/debounceTime';
import { Url } from '@cyber4all/clark-entity/dist/learning-object';

@Component({
  selector: 'clark-url-manager',
  templateUrl: './url-manager.component.html',
  styleUrls: ['./url-manager.component.scss']
})
export class UrlManagerComponent implements OnInit, OnDestroy {
  @Input()
  urls: Url[] = [];

  @Output()
  add: EventEmitter<void> = new EventEmitter();
  @Output()
  update: EventEmitter<{ index: number; url: Url }> = new EventEmitter();
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

  constructor() {}

  ngOnInit() {
    // listen for events on the triggerSave subject and, after 650ms of no events, emit an event to the parent component
    this.triggerSave$
      .takeUntil(this.componentDestroyed$)
      .debounceTime(650)
      .subscribe(() => {
        this.save.emit();
      });

    this.subToUrlUpdates();
  }

  /**
   * Opens subscriptions to updates pushed to Url object. Sets properties that are not undefined and emits update
   *
   * @private
   * @memberof UrlManagerComponent
   */
  private subToUrlUpdates() {
    this.urlUpdated$
      .takeUntil(this.componentDestroyed$)
      .debounceTime(650)
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
    this.triggerSave$.next();
  }

  /**
   * Sets next value of updateUrl by setting title from user input
   */
  updateTitle(index: number, title: string) {
    this.urlUpdated$.next({ index, title, url: undefined });
  }

  /**
   * Sets next value of updateUrl by setting url from user input
   */
  updateUrl(index: number, url: string) {
    this.urlUpdated$.next({ index, url, title: undefined });
  }

  /**
   * Emit's an event to parent component containing the index of the url to be removed
   * and fires next() on the trigger save subject
   * @param index
   */
  removeURL(index: number) {
    this.remove.emit(index);
    this.triggerSave$.next();
  }

  ngOnDestroy() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }
}
