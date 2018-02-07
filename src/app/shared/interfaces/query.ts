export interface Query {
    currPage?: number;
    limit?: number;
}

export interface TextQuery extends Query {
    text: string;
}

export interface MappingQuery extends Query {
    length: string;
    source: string;
    name: string;
}