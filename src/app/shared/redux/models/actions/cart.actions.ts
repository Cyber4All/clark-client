import { Action } from '@ngrx/store';

export const ADD_LEARNING_OBJECT = '[Cart] Add Learning Object';
export const REMOVE_LEARNING_OBJECT = '[Cart] Remove Learning Object';
export const CLEAR = '[Clear] Clear Cart';

export class AddLearningObject implements Action {
    readonly type = ADD_LEARNING_OBJECT;
    // Payload is Learning Object's ID
    constructor(public payload: string) { }
}

export class RemoveLearningObject implements Action {
    readonly type = REMOVE_LEARNING_OBJECT;
    // Payload is Learning Object's ID
    constructor(public payload: string) { }
}

export class Clear implements Action {
    readonly type = CLEAR;
}

export type All =
    AddLearningObject
    | RemoveLearningObject
    | Clear;
