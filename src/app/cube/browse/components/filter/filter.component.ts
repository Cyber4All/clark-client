import { ChangeDetectorRef, Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { LearningObject } from '@entity';
import { CollectionService } from 'app/core/collection.service';
import { RelevancyService } from 'app/core/relevancy.service';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { FilterSectionInfo } from '../filter-section/filter-section.component';

@Component({
  selector: 'clark-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit, OnDestroy {
  @Output() changed: EventEmitter<any> = new EventEmitter();

  // The section filters
  collectionFilter: FilterSectionInfo;
  lengthFilter: FilterSectionInfo;
  topicFilter: FilterSectionInfo;
  materialFilter: FilterSectionInfo;
  levelFilter: FilterSectionInfo;

  // Used to communicate filter changes
  filterChanged$ = new Subject(); // Used to debounce the time to avoid spammed filter changes
  destroyed$ = new Subject();

  constructor(
    private collectionService: CollectionService,
    private relevancyService: RelevancyService,
    private cd: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    // Get the filter information
    await this.getCollectionFilters();
    this.getLengthFilters();
    await this.getTopicFilters();
    this.getMaterialFilters();
    this.getLevelFilters();

    // Register filter changes
    this.filterChanged$
      .pipe(debounceTime(650), takeUntil(this.destroyed$))
      .subscribe(() => this.sendFilterChanges());

    // Update UI
    this.cd.detectChanges();
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
        value: collection.abvName || collection.name,
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
        name: level,
        value: level.toLowerCase(),
        active: false,
      })),
    };
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
