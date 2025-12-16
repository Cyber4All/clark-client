import * as querystring from 'querystring';

export enum OrderBy {
  Name = 'name',
  Date = 'date',
  Downloads = 'downloads',
  Rating = 'rating',
  None = 'none'
}

export enum SortType {
  Ascending = 1,
  Descending = -1
}

export interface Query {
  [index: string]: any;
  currPage?: number;
  limit?: number;
  length?: string[] | string;
  level?: string[];
  guidelines?: string[];
  noGuidelines?: string;
  orderBy?: OrderBy | string;
  sortType?: SortType;
  text?: string;
  standardOutcomes?:
  | string[]
  | { id: string; name: string; date: string; outcome: string }[];
  collection?: string;
  status?: string[];
  fileTypes?: string[];
  start?: Date | string;
  end?: Date | string;
  startNextCheck?: string;
  endNextCheck?: string;
  topics?: string[];
  tags?: string[]
  username?: string;
  admin?: string;
}

export interface MappingQuery extends Query {
  standardOutcomes?:
  | string[]
  | { id: string; name: string; date: string; outcome: string }[];
}

export interface FilterQuery extends Query {
  length?: string[];
  level?: string[];
}

export interface UserQuery extends querystring.ParsedUrlQueryInput {
  accessGroups?: string[],
  sortType?: string,
  page?: number,
  limit?: number,
  text?: string,
}
