/* eslint-disable @typescript-eslint/naming-convention */
export enum FRAMEWORK_PROPERTY {
    ID = 'id',
    NAME = 'name',
    AUTHOR = 'author',
    SOURCE = 'source',
    DESCRIPTION = 'description',
}

export interface Framework {
    name: string;
    author: string;
    source: string;
    description: string;
}

export interface FrameworkDocument extends Framework {
    _id: string;
}
