import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MappingsFilterService {
  // to use this service, provide this in the parent component of the browse-by-mappings component
  constructor() { }

  /**
   * Array of mapped Learning Outcomes
   */
  mappings: any[] = [];

  /**
   * String of current text used to filter outcomes
   */
  filterText = '';

  /**
   * String of currently selected author
   */
  author = '';

  /**
   * Boolean, returns whether or not there are any mappings stored
   */
  get hasMappings(): boolean {
    return this.mappings && this.mappings.length > 0;
  }

  /**
   * Boolean, returns whether or there is any filter text stored
   */
  get hasText(): boolean {
    return this.filterText && this.filterText !== '';
  }
}
