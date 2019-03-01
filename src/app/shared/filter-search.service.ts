import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export type ItemsPerPage = 5 | 10 | 25 | 50 | undefined;
export const ITEMS_PER_PAGE: ItemsPerPage[] = [5, 10, 25, 50, undefined];

// tslint:disable-next-line:interface-over-type-literal
export type Filter = {
  field: string;
  sort: 1 | -1;
};

@Injectable()
export class FilterSearchService {
  private filters$: BehaviorSubject<Filter[]> = new BehaviorSubject<Filter[]>(
    []
  );
  private selectedFilter$: BehaviorSubject<Filter> = new BehaviorSubject<
    Filter
  >(null);
  private searchText$: BehaviorSubject<string> = new BehaviorSubject<string>(
    ''
  );
  private itemsPerPage$: BehaviorSubject<ItemsPerPage> = new BehaviorSubject<
    ItemsPerPage
  >(ITEMS_PER_PAGE[1]);

  private statusFilter$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(
    []
  );

   private selectedStatusFilter$: BehaviorSubject<string[]> = new BehaviorSubject<
  string[]
  >(null);
  constructor() {}

  public getFilters(): BehaviorSubject<Filter[]> {
    return this.filters$;
  }

  public getSelectedFilter(): BehaviorSubject<Filter> {
    return this.selectedFilter$;
  }

  public getSearchText(): BehaviorSubject<string> {
    return this.searchText$;
  }

  public getItemsPerPage(): BehaviorSubject<ItemsPerPage> {
    return this.itemsPerPage$;
  }

  public getStatusFilter(): BehaviorSubject<string[]> {
    return this.statusFilter$;
  }

  public getSelectedStatusFilter(): BehaviorSubject<string[]> {
    return this.selectedStatusFilter$;
  }

  public setFilters(filters: Filter[]): void {
    this.filters$.next(filters);
  }

  public setSelectedFilter(filter: Filter): void {
    this.selectedFilter$.next(filter);
  }

  public setSearchText(searchText: string): void {
    this.searchText$.next(searchText);
  }

  public setItemsPerPage(num: ItemsPerPage): void {
    this.itemsPerPage$.next(num);
  }

  public setStatusFilter(stats: string[]): void {
    this.statusFilter$.next(stats);
  }

  public setSelectedStatusFilter(stat: string[]): void {
    this.selectedStatusFilter$.next(stat);
  }
  public resetFilters() {
    this.filters$.next([]);
    this.selectedFilter$.next(null);
  }

  public resetText() {
    this.searchText$.next('');
  }
  public resetItemsPerPage(): void {
    this.itemsPerPage$.next(ITEMS_PER_PAGE[1]);
  }

  public resetStatusFilter(): void {
    this.statusFilter$.next([]);
    this.selectedStatusFilter$.next(null);
  }
  public resetAll(): void {
    this.resetFilters();
    this.resetText();
    this.resetItemsPerPage();
    this.resetStatusFilter();
  }
}
