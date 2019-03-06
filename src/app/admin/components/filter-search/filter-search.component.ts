import {
    Component,
    OnInit,
    OnDestroy,
    ViewChild,
    ElementRef,
    Output,
    EventEmitter
  } from '@angular/core';
  import { Subscription } from 'rxjs/Subscription';
  import { Observable } from 'rxjs/Rx';
  import 'rxjs/add/observable/fromEvent';
  import 'rxjs/add/operator/map';
  import { CollectionService } from 'app/core/collection.service';
  import { Router } from '@angular/router';
  import { AuthService } from 'app/core/auth.service';
  import { Subject } from 'rxjs';
import { ContextMenuService } from 'app/shared/contextmenu/contextmenu.service';
import { Placeholder } from '@angular/compiler/src/i18n/i18n_ast';
import { Key } from 'protractor';
// import { EventEmitter } from 'protractor';

@Component({
  selector: 'clark-admin-filter-search',
  templateUrl: './filter-search.component.html',
  styleUrls: ['./filter-search.component.scss']
})
export class FilterSearchComponent implements OnInit, OnDestroy {
    private subscriptions: Subscription[] = [];
    private searchText$: Observable<string>;
    selectedCollection: { abvName: string, name: string };
    selectedStatusFilter: string[];
    collections: { abvName: string, name: string }[] = [];
    isCollectionRestricted = false;
    filtersModified$: Subject<void> = new Subject();
    // collection
    // filters applied to dashboard objects (status filters)
    filters: Map<string, boolean> = new Map();

    @Output() userInput = new EventEmitter<string>();
    @ViewChild('searchInput') searchInput: ElementRef;

    searchText;
    filterMenu: string;
    filterMenuDown = false;
    collectionMenu: string;
    collectionMenuDown = false;
    collectionFilterOptions: string[];
    statusFilterOptions: string[];
    constructor(
      private collectionService: CollectionService,
      private authService: AuthService,
      private contextMenuService: ContextMenuService,
      private router: Router) { }

    ngOnInit() {
      this.subToCollections();
      this.findUserRestrictions();
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
      this.userInput.emit(filter);
    }
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

    ngOnDestroy() {
      for (const sub of this.subscriptions) {
        sub.unsubscribe();
      }
    }

}
