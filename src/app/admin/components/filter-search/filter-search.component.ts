import {
    Component,
    OnInit,
    OnDestroy,
    ViewChild,
    ElementRef
  } from '@angular/core';
  import { Subscription } from 'rxjs/Subscription';
  import { Observable } from 'rxjs/Rx';
  import 'rxjs/add/observable/fromEvent';
  import 'rxjs/add/operator/map';
  import { CollectionService } from 'app/core/collection.service';
  import { Router } from '@angular/router';
  import { AuthService } from 'app/core/auth.service';
  import { Subject } from 'rxjs';
  import {
    ItemsPerPage,
    ITEMS_PER_PAGE,
    Filter,
    FilterSearchService
  } from 'app/shared/filter-search.service';
import { ContextMenuService } from 'app/shared/contextmenu/contextmenu.service';

@Component({
  selector: 'clark-admin-filter-search',
  templateUrl: './filter-search.component.html',
  styleUrls: ['./filter-search.component.scss']
})
export class FilterSearchComponent implements OnInit, OnDestroy {
    private subscriptions: Subscription[] = [];
    private searchText$: Observable<string>;
    selectedFilter: Filter;
    selectedCollection: { abvName: string, name: string };
    itemsPerPage: ItemsPerPage[] = ITEMS_PER_PAGE;
    selectedStatusFilter: string[];
    limit: ItemsPerPage;
    collections: { abvName: string, name: string }[] = [];
    isCollectionRestricted = false;
    filtersModified$: Subject<void> = new Subject();
    // collection
    // filters applied to dashboard objects (status filters)
    filters: Map<string, boolean> = new Map();

    @ViewChild('searchInput') searchInput: ElementRef;

    searchText;
    filterOptions: Filter[] = [];
    filterMenu: string;
    filterMenuDown = false;
    collectionMenu: string;
    collectionMenuDown = false;
    collectionFilterOptions: string[];
    statusFilterOptions: string[];
    constructor(
      private filterSearchService: FilterSearchService,
      private collectionService: CollectionService,
      private authService: AuthService,
      private contextMenuService: ContextMenuService,
      private router: Router) { }

    ngOnInit() {
      this.subToFilters();
      this.subToSearchTextChange();
      this.subToSearchText();
      this.subToItemsPerPage();
      this.subToStatusFilter();
      this.subToSelectedFilter();
      this.subToSelectedStatusFilter();
      this.subToCollections();
      this.findUserRestrictions();
    }

    private subToFilters(): void {
      this.subscriptions.push(
        this.filterSearchService.getFilters().subscribe(options => {
          this.filterOptions = options;
        })
      );
    }

    private subToSearchTextChange(): void {
      this.subscriptions.push(
        this.filterSearchService.getSearchText().subscribe(text => {
          this.searchText = text;
        })
      );
    }

    private subToItemsPerPage() {
      this.subscriptions.push(
        this.filterSearchService.getItemsPerPage().subscribe(limit => {
          this.limit = limit;
        })
      );
    }

    private subToStatusFilter() {
      this.subscriptions.push(
        this.filterSearchService.getStatusFilter().subscribe(statFitler => {
          this.statusFilterOptions = statFitler;
        })
      );
    }
    private subToSelectedFilter(): void {
      this.subscriptions.push(
        this.filterSearchService.getSelectedFilter().subscribe(filter => {
          if (filter) {
            this.selectedFilter = filter;
          }
        })
      );
    }

    private subToSelectedStatusFilter(): void {
      this.subscriptions.push(
        this.filterSearchService.getSelectedStatusFilter().subscribe(statsFilter => {
          if (statsFilter) {
            this.selectedStatusFilter = statsFilter;
          }
        })
      );
    }
    private subToCollections(): void {
      this.collectionService.getCollections().then(collections => {
        this.collections = collections.map(c => ({ abvName: c.abvName, name: c.name }));
        this.collections.push({ abvName: '', name: 'All' });
        this.collections.sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
      });
    }
    /**
     * Checks for user's authorization
     */
    private findUserRestrictions() {
      this.authService.user['accessGroups'].forEach((group: string) => {
        if (group.includes('@')) {
          this.isCollectionRestricted = true;
        }
      });
    }

    /**
   * Hide or show the filter dropdown menu
   * @param event {MouseEvent} the mouse event from clicking
   */
  toggleFilterMenu(event: MouseEvent) {
    if (this.filterMenu) {
      if (!this.filterMenuDown && event) {
        this.contextMenuService.open(this.filterMenu, (event.currentTarget as HTMLElement), { top: 10, left: 5 });
      } else {
        this.contextMenuService.destroy(this.filterMenu);
      }

      this.filterMenuDown = event ? true : false;
    } else {
      console.error('Error! Attempted to use an unregistered context menu');
    }
  }

  /**
   * Hide or show the collection filter dropdown menu
   * @param event {MouseEvent} the event from clicking
   */
  toggleCollectionMenu(event: MouseEvent) {
    if (this.collectionMenu) {
      if (!this.collectionMenuDown && event) {
        this.contextMenuService.open(this.collectionMenu, (event.currentTarget as HTMLElement), { top: 10, left: 5 });
      } else {
        this.contextMenuService.destroy(this.collectionMenu);
      }

      this.collectionMenuDown = event ? true : false;
    } else {
      console.error('Error! Attempted to use an unregistered context menu');
    }
  }

  /**
   * Add or remove filter from filters list
   * @param filter {string} the filter to be toggled
   */
  toggleFilter(filter: string) {
    if (this.filters.get(filter)) {
      this.filters.delete(filter);
    } else {
      this.filters.set(filter, true);
    }

    this.filtersModified$.next();
  }

  /**
   * Remove all applied filters
   */
  clearFilters() {
    this.filters = new Map();
    this.filtersModified$.next();
  }

    goToCollection() {
      this.router.navigate([`objects/${this.selectedCollection.abvName}`]);
    }

    setSelected(): void {
      this.filterSearchService.setSelectedFilter(this.selectedFilter);
    }
    setLimit(limit: ItemsPerPage): void {
      this.filterSearchService.setItemsPerPage(limit);
    }

    setStatusFilter(): void {
      this.filterSearchService.setSelectedStatusFilter(this.selectedStatusFilter);
    }

    subToSearchText(): void {
      if (this.searchInput.nativeElement) {
        this.searchText$ = Observable.fromEvent(
          this.searchInput.nativeElement,
          'input'
        ).map(x => x['currentTarget'].value);

        this.subscriptions.push(
          this.searchText$.subscribe(text => {
            this.filterSearchService.setSearchText(text);
          })
        );
      }
    }

    ngOnDestroy() {
      for (const sub of this.subscriptions) {
        sub.unsubscribe();
      }
    }

}
