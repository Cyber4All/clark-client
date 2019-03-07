import {Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';
import {CollectionService} from 'app/core/collection.service';
import {AuthService} from 'app/core/auth.service';
import {Subject} from 'rxjs';
import {ContextMenuService} from 'app/shared/contextmenu/contextmenu.service';

@Component({
  selector: 'clark-admin-filter-search',
  templateUrl: './filter-search.component.html',
  styleUrls: ['./filter-search.component.scss']
})
export class FilterSearchComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  collections: { abvName: string, name: string }[] = [];
  isCollectionRestricted = false;
  filtersModified$: Subject<void> = new Subject();
  // collection
  // filters applied to dashboard objects (status filters)
  filters: Map<string, boolean> = new Map();

  @Output() statusFilter = new EventEmitter<string>();
  @Output() collectionFilter = new EventEmitter<string>();
  @ViewChild('searchInput') searchInput: ElementRef;

  filterMenu: string;
  filterMenuDown = false;
  collectionMenu: string;
  collectionMenuDown = false;

  constructor(
    private collectionService: CollectionService,
    private authService: AuthService,
    private contextMenuService: ContextMenuService,
    ) { }

  ngOnInit() {
    this.subToCollections();
    this.findUserRestrictions();
  }

  private subToCollections(): void {
    this.collectionService.getCollections().then(collections => {
      this.collections = collections.map(c => ({abvName: c.abvName, name: c.name}));
      this.collections.push({abvName: '', name: 'All'});
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
        this.contextMenuService.open(this.filterMenu, (event.currentTarget as HTMLElement), {top: 10, left: 5});
      } else {
        this.contextMenuService.destroy(this.filterMenu);
      }

      this.filterMenuDown = !!event;
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
        this.contextMenuService.open(this.collectionMenu, (event.currentTarget as HTMLElement), {top: 10, left: 5});
      } else {
        this.contextMenuService.destroy(this.collectionMenu);
      }

      this.collectionMenuDown = !!event;
    } else {
      console.error('Error! Attempted to use an unregistered context menu');
    }
  }

  /**
   * Add or remove filter from filters list
   * @param filter {string} the filter to be toggled
   */
  toggleStatusFilter(filter: string) {
    if (this.filters.get(filter)) {
      this.filters.delete(filter);
    } else {
      this.filters.set(filter, true);
      this.statusFilter.emit(filter);
    }
  }

  /**
   * Add or remove filter from filters list
   * @param filter {string} the filter to be toggled
   */
  toggleCollectionFilter(filter: string) {
    if (this.filters.get(filter)) {
      this.filters.delete(filter);
    } else {
      this.filters.set(filter, true);
      this.collectionFilter.emit(filter);
    }
  }

  /**
   * Remove all applied filters
   */
  clearFilters() {
    this.filters = new Map();
    this.filtersModified$.next();
  }

  ngOnDestroy() {
    for (const sub of this.subscriptions) {
      sub.unsubscribe();
    }
  }

}
