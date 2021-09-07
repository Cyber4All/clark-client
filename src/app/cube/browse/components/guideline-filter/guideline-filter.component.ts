import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { GuidelineService } from 'app/core/guideline.service';
import { FrameworkDocument } from 'entity/standard-guidelines/Framework';
import { SearchItemDocument } from 'entity/standard-guidelines/search-index';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { FilterSectionInfo } from '../filter-section/filter-section.component';

@Component({
  selector: 'clark-guideline-filter',
  templateUrl: './guideline-filter.component.html',
  styleUrls: ['./guideline-filter.component.scss']
})
export class GuidelineFilterComponent implements OnInit, OnDestroy {
  destroyed$: Subject<void> = new Subject<void>();

  // Framework filter
  frameworkFilter: FilterSectionInfo;
  selectedFramework: FrameworkDocument;

  // Guidelines filter
  guidelines: SearchItemDocument[];
  selectedGuidelines: SearchItemDocument[];

  // Guidelines search
  searchChange$: Subject<string> = new Subject<string>();
  query: string;
  page = 1;
  total = 0;

  constructor(
    private guidelineService: GuidelineService,
    private cd: ChangeDetectorRef
  ) { }

  async ngOnInit(): Promise<void> {
    await this.getFrameworkFilters();

    this.searchChange$.pipe(debounceTime(650), takeUntil(this.destroyed$)).subscribe(query => {
      this.query = query;
      this.searchGuidelines();
    });

    await this.searchGuidelines();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

  /**
   * Registers that a filter option was selected
   *
   * Note: no need to emit the value up because filter has
   * the info object since its passed by reference
   *
   * @param value The value that was selected
   */
   selectFrameworkOption(value: string) {
    const index = this.frameworkFilter.filters.findIndex(filter => filter.value === value);
    this.frameworkFilter.filters.forEach(filter => filter.active = false);
    if (index >= 0) {
      this.frameworkFilter.filters[index].active = true;
      this.cd.detectChanges();
    }
    this.searchGuidelines();
  }

  /**
   * Registers that a filter option was deselected
   *
   * Note: no need to emit the value up because filter has
   * the info object since its passed by reference
   *
   * @param value The value that was deselected
   */
  deselectFrameworkOption(value: string) {
    const index = this.frameworkFilter.filters.findIndex(filter => filter.value === value);
    if (index >= 0) {
      this.frameworkFilter.filters[index].active = false;
      this.cd.detectChanges();
    }
    this.searchGuidelines();
  }

  /**
   * Gets the selected framework if it exists
   *
   * @returns A string of the framework name selected
   */
  private getSelectedFramework(): string {
    const framework = this.frameworkFilter.filters.find(filter => filter.active);
    return framework ? framework.value : undefined;
  }

  /**
   * Gets the framework filters
   */
  async getFrameworkFilters() {
    const frameworks = await this.guidelineService.getFrameworks();
    this.frameworkFilter = {
      section: 'Frameworks',
      filters: frameworks.map(framework => ({
        name: framework.name,
        value: framework.name,
        active: false,
      })),
    };
    this.cd.detectChanges();
  }

  /**
   * Searches for guidelines to select
   */
  async searchGuidelines() {
    // Build the query
    const query: any = {
      text: this.query,
      page: this.page,
    };
    const framework = this.getSelectedFramework();
    if (framework) {
      query.frameworks = framework;
    }

    // Get the results
    const result = await this.guidelineService.getGuidelines(query);
    this.guidelines = result.results;
    this.total = result.total;
    this.cd.detectChanges();
  }

}
