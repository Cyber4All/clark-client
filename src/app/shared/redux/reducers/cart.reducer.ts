import * as CartActions from '../models/actions/cart.actions';
import { Cart } from '../models/cart.model';
import { environment } from '../../../../environments/environment';

export type Action = CartActions.All;

const DEFAULT_STATE: Cart = {
    items: [],
}

export const CART_STORAGE_LOCATION = 'cart';

/**
 * Adds LearningObject's ID to Cart's items if not already in Cart
 *
 * @param {Cart} state
 * @param {string} learningObjectID
 * @returns
 */
const addLearningObject = (state: Cart, learningObjectID: string) => {
    state.items.indexOf(learningObjectID) === -1 ? state.items.push(learningObjectID)
        : 'LearningObject\'s ID is already in user\'s cart. Show them a message saying so.';

    return state;
}
/**
 * Removes LearningObject's ID from Cart's items
 *
 * @param {Cart} state
 * @param {string} learningObjectID
 * @returns
 */
const removeLearningObject = (state: Cart, learningObjectID: string) => {
    let index = state.items.indexOf(learningObjectID);
    index > -1 ? state.items.splice(index, 1) : 'LearningObject\'s ID does not exist in cart???'
    return state;
}
/**
 * Retrieves Cart's current state
 *
 * @returns
 */
const retrieveState = () => {
    return localStorage.getItem(environment.STATE_STORAGE_LOCATION);
}

export function cartReducer(state: Cart = DEFAULT_STATE, action: Action) {
    console.log(action.type, state);
    switch (action.type) {
        case CartActions.ADD_LEARNING_OBJECT:
            return addLearningObject(state, action.payload);

        case CartActions.REMOVE_LEARNING_OBJECT:
            return removeLearningObject(state, action.payload);

        case CartActions.CLEAR:
            console.log("WRONG WRONG WRONG", DEFAULT_STATE);
            return { items: [] };

        default:
            if (retrieveState()) {
                let sessionState = JSON.parse(retrieveState())[CART_STORAGE_LOCATION];
                return sessionState;
            }
            else {
                return DEFAULT_STATE;
            }
    }

}
