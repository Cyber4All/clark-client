import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { COPY } from './search.copy';
import { takeUntil, filter } from 'rxjs/operators';
import { NavbarService } from 'app/core/client-module/navbar.service';

@Component({
  selector: 'clark-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  copy = COPY;

  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChild('optionOneSwitch') optionOneSwitch: ElementRef;
  @ViewChild('optionTwoSwitch') optionTwoSwitch: ElementRef;

  searchValue = '';
  textQuery: boolean;

  // flags
  selected = 1;
  selectedSource: string;
  toggled = false;

  destroyed$: Subject<void> = new Subject();

  // This is passed to the mappings-filter component, which will subscribe to it. On event, the component will close all dropdowns
  closeMappingsDropdown: Subject<any> = new Subject();
  focusMappingsDropdown: Subject<any> = new Subject();
  blurMappingsDropdown: Subject<any> = new Subject();
  descriptionText =
    this.selected === 1
      ? 'Search for learning objects by organization, user, or keyword/phrase.'
      : 'Search for learning objects by mapped guidelines';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private navService: NavbarService,
  ) {}

  ngOnInit() {
    // force search bar to reflect current search on browse page when navigating by url query parameters
    this.router.events
      .pipe(
        filter((x) => x instanceof NavigationEnd),
        takeUntil(this.destroyed$),
      )
      .subscribe((x: NavigationEnd) => {
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

    this.navService.query.subscribe((change: boolean) => {
      if (change) {
        this.searchValue = '';
        this.navService.query.next(false);
      }
    });
  }

  togglePlaceholder() {
    if (this.searchValue.length === 0) {
      (
        document.getElementById('clark-search-input') as HTMLInputElement
      ).placeholder = 'Search...';
    }
  }

  /**
   * Takes a reference to the searchbar input to pass as a query to the browse component.
   *
   * @param searchbar reference to input
   */
  performSearch(searchbar) {
    searchbar.value = searchbar.value.trim();
    const errorMessage = document.getElementById('search-alert');
    const text = searchbar.value;
    if (text.length < 3) {
      errorMessage.style.display = 'block';
      setTimeout(() => {
        errorMessage.style.display = 'none'; // Hide after 3 seconds
      }, 3000);
      return;
    } else if (text.length) {
      searchbar.blur();

      this.router.navigate(['/browse'], {
        queryParams: {
          // Keep the current filters and sorts but start at 1 when searching by text
          ...this.route.snapshot.queryParams,
          text,
          currPage: 1,
          // Disable any other sorting
          orderBy: ''
        },
      });
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
