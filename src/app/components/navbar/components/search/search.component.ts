import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  OnDestroy
} from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { COPY } from './search.copy';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
  selector: 'clark-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  copy = COPY;

  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  @ViewChild('optionOneSwitch') optionOneSwitch: ElementRef;
  @ViewChild('optionTwoSwitch') optionTwoSwitch: ElementRef;

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

  /**
   * Takes a reference to the searchbar input to pass as a query to the browse component.
   * @param searchbar reference to input
   */
  performSearch(searchbar) {
    searchbar.value = searchbar.value.trim();
    const text = searchbar.value;
    if (text.length) {
      searchbar.blur();
      this.router.navigate(['/browse'], { queryParams: { text, currPage: 1 }});
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

}
