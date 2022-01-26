import { LEVEL } from './IGuideline';

export enum SEARCH_ITEM_PROPERTY {
  LEVEL = 'level',
  AUTHOR = 'author',
  YEAR = 'year',
  GUIDELINE_ID = 'guideline id',
  FRAMEWORK_NAME = 'framework name',
  FRAMEWORK_DESCRIPTION = 'framework description',
  GUIDELINE_NAME = 'guideline name',
  GUIDELINE_DESCRIPTION = 'guideline description',
}

export interface SearchItem {
  levels: LEVEL[];
  author: string;
  year: string;
  guidelineId: string;
  frameworkName: string;
  frameworkDescription: string;
  guidelineName: string;
  guidelineDescription: string;
}

export interface SearchItemDocument extends SearchItem {
  _id: string;
}
