export enum OrderBy {
  Name = 'name',
  Date = 'date'
}

export enum SortType {
  Ascending = 1,
  Descending = -1
}

export interface Query {
  currPage?: number;
  limit?: number;
  length?: string[] | string;
  level?: string[];
  orderBy?: OrderBy;
  sortType?: SortType;
  text?: string;
  standardOutcomes?:
    | string[]
    | { id: string; name: string; date: string; outcome: string }[];
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
