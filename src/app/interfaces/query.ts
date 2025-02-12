import * as querystring from 'querystring';

export enum OrderBy {
  Name = 'name',
  Date = 'date'
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
  orderBy?: OrderBy;
  sortType?: SortType;
  text?: string;
  standardOutcomes?:
    | string[]
    | { id: string; name: string; date: string; outcome: string }[];
  collection?: string;
  status?: string[];
  fileTypes?: string[];
  startNextCheck?: string;
  endNextCheck?: string;
  topics?: string[];
  tags?: string[]
  username?: string;
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

export interface UserQuery extends querystring.ParsedUrlQueryInput{
  accessGroups?: string[],
  sortType?: string,
  page?: number,
  limit?: number,
  text?: string,
}
