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

@Component({
  selector: 'clark-url-manager',
  templateUrl: './url-manager.component.html',
  styleUrls: ['./url-manager.component.scss']
})
export class UrlManagerComponent implements OnInit, OnDestroy {
  @Input()
  urls: any[] = [];

  @Output()
  add: EventEmitter<void> = new EventEmitter();
  @Output()
  remove: EventEmitter<number> = new EventEmitter();
  @Output()
  save: EventEmitter<void> = new EventEmitter();

  triggerSave$ = new Subject();
  componentDestroyed$ = new Subject();

  constructor() {}

  ngOnInit() {
    // listen for events on the triggerSave subject and, after 650ms of no events, emit an event to the parent component
    this.triggerSave$
      .takeUntil(this.componentDestroyed$)
      .debounceTime(650)
      .subscribe(() => {
        this.save.emit();
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
