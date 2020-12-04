import { TemplateRef } from '@angular/core';

/**
 * A data structure that defines the view and behavior of a section of filters.
 *
 * Determining the title here will allow us to change the title without changing
 * backend logic for the name of the specific filter.
 */
export interface FilterSection {
  /**
   * The title that appears in the UI.
   */
  title: string;
  /**
   * The name that is sent to the backend for the specific filter.
   */
  name: string;
  type: 'select-many' | 'select-one' | 'dropdown-one' | 'custom';
  canSearch?: boolean;
  values?: {
    name: string;
    value?: string;
    active?: boolean;
    toolTip?: string;
  }[];
  template?: TemplateRef<any>;
  isExpanded?: boolean;
}
