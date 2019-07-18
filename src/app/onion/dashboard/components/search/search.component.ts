import { Component, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
@Component({
  selector: 'clark-dashboard-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnDestroy {
  @Input() value: string;
  @Output() text: EventEmitter<string> = new EventEmitter();
  searchString$: BehaviorSubject<string> = new BehaviorSubject('');
  componentDestroyed$: Subject<void> = new Subject();

  constructor() {
    this.searchString$
      .pipe(
        takeUntil(this.componentDestroyed$),
        debounceTime(650)
      )
      .subscribe(() => {
        this.submitSearch();
      });
  }

  submitSearch(event?: KeyboardEvent) {
    if (!event || event.keyCode === 13) {
      // no event was passed or event was passed and key pressed is enter key
      this.text.emit(this.value);
    }
  }

  ngOnDestroy() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }
}
