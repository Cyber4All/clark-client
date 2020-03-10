import { Component, AfterViewInit, Input, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { map, debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'clark-admin-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements AfterViewInit {
  @Input() placeholder: string;
  @Output() userInput = new EventEmitter<string>();
  @ViewChild('searchInput', { read: ElementRef })
  searchInput: ElementRef;
  destroyed$: Subject<void> = new Subject();

  constructor() { }

  ngAfterViewInit() {
    fromEvent(this.searchInput.nativeElement, 'input').pipe(
      map(x => x['currentTarget'].value),
      debounceTime(650),
      takeUntil(this.destroyed$)
    ).subscribe(val => {
        this.userInput.emit(val);
    });
  }
}

