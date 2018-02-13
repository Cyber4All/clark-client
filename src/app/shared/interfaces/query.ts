export interface Query {
    currPage?: number;
    limit?: number;
    length?: string[] | string;
    level?: string[];
    sort?: string;
    sortAscending?: boolean;
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