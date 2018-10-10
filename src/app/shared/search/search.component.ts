import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  Output,
  EventEmitter,
  AfterViewChecked,
  Input,
  OnDestroy
} from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { COPY } from './search.copy';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
  selector: 'clark-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, AfterViewChecked, OnDestroy {
  copy = COPY;

  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChild('optionOneSwitch') optionOneSwitch: ElementRef;
  @ViewChild('optionTwoSwitch') optionTwoSwitch: ElementRef;

  @Input() focus: Subject<any>;
  @Input() blur: Subject<any>;

  @Output() didFocus: EventEmitter<any> = new EventEmitter();
  @Output() didBlur: EventEmitter<any> = new EventEmitter();
  @Output() close: EventEmitter<any> = new EventEmitter();

  searchValue = '';

  // flags
  selected = 1;
  selectedSource: string;
  toggled = false;

  destroyed$: Subject<void> = new Subject();

  // This is passed to the mappings-filter component, which will subscribe to it. On event, the component will close all dropdowns
  closeMappingsDropdown: Subject<any> = new Subject();
  focusMappingsDropdown: Subject<any> = new Subject();
  blurMappingsDropdown: Subject<any> = new Subject();
  descriptionText = (this.selected === 1) ?
    'Search for learning objects by organization, user, or keyword/phrase.' :
    'Search for learning objects by mapped standard outcomes';

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    if (this.focus) {
      this.focus.pipe(
        takeUntil(this.destroyed$)
      ).subscribe({
        next: () => {
          this.performFocus();
        }
      });
    }

    if (this.blur) {
      this.blur.pipe(
        takeUntil(this.destroyed$)
      ).subscribe({
        next: () => {
          this.performBlur();
        }
      });
    }

    // force search bar to reflect current search on browse page when navigating by url query parameters
    this.router.events.pipe(
      filter(x => x instanceof NavigationEnd),
      takeUntil(this.destroyed$)
    ).subscribe((x: NavigationEnd) => {
      const textParam = this.route.snapshot.queryParamMap.get('text');

      // if we're on the browse page, check query params for new text paran and repopulate
      if (x.url.match(/\/browse.*/)) {
        if (textParam) {
          this.searchValue = textParam;
        } else {
          this.searchValue = '';
        }
      }
    });
  }

  toggle(active: number) {
    // do nothing if same number
    if (active !== this.selected) {
      const next = active === 1 ? this.optionOneSwitch : this.optionTwoSwitch;
      const current = this.selected === 1 ? this.optionOneSwitch : this.optionTwoSwitch;

      next.nativeElement.style.transitionDelay = '0.2s';
      current.nativeElement.style.transitionDelay = '0s';

      this.selected = active;
      this.toggled = true;
    }
  }

  ngAfterViewChecked() {
    if (this.toggled) {
      this.toggled = false;
      this.performFocus();
    }
  }

  performFocus() {
    if (this.selected === 1) {
      this.searchInput.nativeElement.focus();
    } else {
      this.focusMappingsDropdown.next();
    }
  }

  performBlur() {
    if (this.selected === 1) {
      this.searchInput.nativeElement.blur();
    } else {
      this.blurMappingsDropdown.next();
    }
  }

  /**
   * Takes a reference to the searchbar input to pass as a query to the browse component.
   * @param searchbar reference to input
   */
  performSearch(searchbar) {
    searchbar.value = searchbar.value.trim();
    const text = searchbar.value;
    if (text.length) {
      searchbar.blur();
      this.didBlur.emit();
      this.router.navigate(['/browse'], { queryParams: { text }});
    }

    this.close.emit();
  }

  /**
   * Takes am outcome id and passes it to the browse component as a query parameter
   * @param outcomeId id of outcome
   */
  performOutcomeSearch(outcomeId) {
    this.closeMappingsDropdown.next();
    this.router.navigate(['/browse'], { queryParams: {standardOutcomes: outcomeId} });
  }

  toggleMappingsFilterSource(sourceName: string) {
    if (sourceName === this.selectedSource) {
      // we're toggling it off
      this.selectedSource = undefined;
    } else {
      // we're changing it
      this.selectedSource = sourceName;
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

}
