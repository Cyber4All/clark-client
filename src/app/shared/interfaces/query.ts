export enum OrderBy {
    Name = 'name_',
    Date = 'date'
}

export enum SortType {
    Ascending = 1,
    Descending = -1,
}

export interface Query {
    currPage?: number;
    limit?: number;
    length?: string[] | string;
    level?: string[];
    sortBy?: OrderBy;
    sortType?: SortType;
}

export interface TextQuery extends Query {
    text: string;
}

export interface MappingQuery extends Query {
    source: string;
    name: string;
}

export interface FilterQuery extends Query {
    length: string[];
    level: string[];
}