import { ChangeDetectorRef, Component, OnInit, Output, EventEmitter, OnDestroy, Input } from '@angular/core';
import { LearningObject } from '@entity';
import { CollectionService } from 'app/core/collection-module/collections.service';
import { GuidelineService } from 'app/core/standard-guidelines-module/standard-guidelines.service';
import { RelevancyService } from 'app/core/learning-object-module/relevancy/relevancy.service';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { FilterSectionInfo } from '../filter-section/filter-section.component';
import { Query } from '../../../../interfaces/query';

@Component({
  selector: 'clark-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit, OnDestroy {
  @Input() clear: Observable<void>;
  @Input() selected?: Query;
  @Output() changed: EventEmitter<any> = new EventEmitter();

  // The section filters
  collectionFilter: FilterSectionInfo;
  lengthFilter: FilterSectionInfo;
  topicFilter: FilterSectionInfo;
  materialFilter: FilterSectionInfo;
  levelFilter: FilterSectionInfo;
  frameworkFilter: FilterSectionInfo;
  guidelineFilter: string[] = [];

  // Used to communicate filter changes
  filterChanged$ = new Subject(); // Used to debounce the time to avoid spammed filter changes
  destroyed$ = new Subject();

  // Advanced search
  showAdvancedSearch = false;

  constructor(
    private collectionService: CollectionService,
    private relevancyService: RelevancyService,
    private guidelineService: GuidelineService,
    private cd: ChangeDetectorRef
  ) { }

  async ngOnInit(): Promise<void> {
    // Get the filter information
    await this.getCollectionFilters();
    this.getLengthFilters();
    await this.getTopicFilters();
    this.getMaterialFilters();
    this.getLevelFilters();
    await this.getFrameworkFilters();
    this.parseSelected();

    // Register filter changes
    this.filterChanged$
      .pipe(debounceTime(650), takeUntil(this.destroyed$))
      .subscribe(() => this.sendFilterChanges());

    this.clear
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.clearFilters());

    // Update UI
    this.cd.detectChanges();
  }

  /**
   * Parses a query object which saves the current
   * query state (used for mobile filters)
   */
  private parseSelected() {
    if (this.selected) {
      this.parseCategorySelected(this.selected.length, this.lengthFilter.filters);
      this.parseCategorySelected(this.selected.level, this.levelFilter.filters);
      this.parseCategorySelected(this.selected.topics, this.topicFilter.filters);
      this.parseCategorySelected(this.selected.fileTypes, this.materialFilter.filters);
      this.parseCategorySelected(this.selected.guidelines, this.frameworkFilter.filters);
      this.parseCategorySelected(this.selected.collection, this.collectionFilter.filters);
    }
  }

  /**
   * Sets each filter to active if they are already
   * selected
   *
   * @param selectedCategory The query selected category
   * (i.e. length, level, collection, etc)
   * @param filters The filters array associated with the
   * category to check
   */
  private parseCategorySelected(
    selectedCategory: string[] | string,
    filters: { active: boolean, name: string, value: string, tip?: string }[]
  ) {
    if (selectedCategory && selectedCategory.length > 0) {
      filters.forEach(filter => {
        if (selectedCategory.includes(filter.value)) {
          filter.active = true;
        }
      });
    }
  }

  /**
   * Opens the advanced search popup
   */
  openAdvancedSearch() {
    this.showAdvancedSearch = true;
    this.cd.detectChanges();
  }

  /**
   * Clears all the filters (sets them as not active)
   */
  clearFilters() {
    // Clear each category filter
    this.clearFilterCategory(this.collectionFilter.filters);
    this.clearFilterCategory(this.lengthFilter.filters);
    this.clearFilterCategory(this.levelFilter.filters);
    this.clearFilterCategory(this.materialFilter.filters);
    this.clearFilterCategory(this.topicFilter.filters);
    this.clearFilterCategory(this.frameworkFilter.filters);
    this.guidelineFilter = [];

    // Detect changes and resend the filter object
    this.cd.detectChanges();
    this.sendFilterChanges();
  }

  /**
   * Sets each filter to inactive in a filter category
   *
   * @param filters The array of filters
   */
  private clearFilterCategory(filters: { active: boolean, name: string, value: string, tip?: string }[]) {
    filters.forEach(filter => filter.active = false);
  }

  /**
   * Formats the filter query to search/filter
   */
  sendFilterChanges() {
    const query = {};

    // Creates the query
    this.checkFilter('collection', this.collectionFilter.filters, query);
    this.checkFilter('length', this.lengthFilter.filters, query);
    this.checkFilter('level', this.levelFilter.filters, query);
    this.checkFilter('fileTypes', this.materialFilter.filters, query);
    this.checkFilter('topics', this.topicFilter.filters, query);
    this.checkFilter('guidelines', this.frameworkFilter.filters, query);
    if (this.guidelineFilter && this.guidelineFilter.length > 0) {
      query['standardOutcomes'] = this.guidelineFilter;
    }

    // Emits changes
    this.changed.emit(query);
  }

  /**
   * Appends the filter query with the given filter category if it exists
   *
   * @param category the filter category to append
   * @param filters The filters to append to the category
   * @param query The query object to emit
   */
  private checkFilter(category: string, filters: { active: boolean, name: string, value: string, tip?: string }[], query: any) {
    const f = filters.filter(filter => filter.active);
    if (f && f.length > 0) {
      query[category] = f.map(filter => filter.value);
    }
  }

  /**
   * Registers a change in the filter, used for debounce-ing the filter selection
   */
  registerChange() {
    this.filterChanged$.next();
  }

  /**
   * Gets the collection filters
   */
  async getCollectionFilters() {
    const collections = await this.collectionService.getCollections();
    this.collectionFilter = {
      section: 'Collection',
      filters: collections.map(collection => ({
        name: collection.name,
        value: collection.abvName,
        active: false,
      })).sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      }),
    };
  }

  /**
   * Gets the length filters
   */
  getLengthFilters() {
    this.lengthFilter = {
      section: 'Length',
      filters: [
        { name: 'Nanomodule', value: 'nanomodule', active: false, tip: 'A learning object up to 1 hour in length' },
        { name: 'Micromodule', value: 'micromodule', active: false, tip: 'A learning object between to 1 and 4 hours in length' },
        { name: 'Module', value: 'module', active: false, tip: 'A learning object between 4 and 10 hours in length' },
        { name: 'Unit', value: 'unit', active: false, tip: 'A learning object over 10 hours in length' },
        { name: 'Course', value: 'course', active: false, tip: 'A learning object 15 weeks in length' },
      ],
    };
  }

  /**
   * Gets the topic filters
   */
  async getTopicFilters() {
    const topics = await this.relevancyService.getTopics();
    this.topicFilter = {
      section: 'Topic',
      filters: topics.map(topic => ({
        name: topic.name,
        value: topic._id,
        active: false,
      })),
    };
  }

  /**
   * Gets the material filters
   */
  getMaterialFilters() {
    this.materialFilter = {
      section: 'Type of Material',
      filters: [{
        name: 'Video',
        value: 'video',
        active: false,
      }]
    };
  }

  /**
   * Gets the level filters
   */
  getLevelFilters() {
    this.levelFilter = {
      section: 'Level',
      filters: Object.values(LearningObject.Level).map(level => ({
        name: level.replace(
          /\w\S*/g, ((txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          })
        ),
        value: level,
        active: false,
      })),
    };
  }

  /**
   * Gets the framework filters
   */
  async getFrameworkFilters() {
    const frameworks = await this.guidelineService.getFrameworks({ limit: 100, page: 1 });
    this.frameworkFilter = {
      section: 'Guidelines',
      filters: frameworks.map(framework => ({
        name: framework.name,
        value: framework.name,
        active: false,
      })),
    };
  }

  /**
   * Closes the advanced search popup
   */
  closeAdvancedSearch() {
    this.showAdvancedSearch = false;
    this.cd.detectChanges();
  }

  /**
   * Grabs the guideline ids from the event and set them in the filter
   *
   * @param guidelineIds The new guideline ids selected
   */
  filterGuidelines(guidelineIds: string[]) {
    this.guidelineFilter = guidelineIds;
    this.closeAdvancedSearch();
    this.registerChange();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
