import { Injectable } from '@angular/core';
import { Store } from "@ngrx/store";
import { Observable } from "rxjs/Observable";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Cart } from '../redux/models/cart.model';
import { CART_STORAGE_LOCATION } from '../redux/reducers/cart.reducer';
import { environment } from '../../../environments/environment';
import * as CartActions from '../redux/models/actions/cart.actions';


interface AppState {
    cart: {
        items: Array<string>;
    };
}


@Injectable()
export class CartService {

    cart$: Observable<Cart>;

    constructor(private store: Store<AppState>) {
        //Set cart to Cart Redux Store
        this.cart$ = this.store.select(CART_STORAGE_LOCATION);
        //Subscribe to Redux Store state
        this.store.subscribe((state) => {
            sessionStorage.setItem(environment.STATE_STORAGE_LOCATION, JSON.stringify(state));
        });
    }
    /**
     * Adds LearningObject's ID to Cart via Redux Store
     * 
     * @param {string} learningObjectID 
     * @memberof CartService
     */
    addLearningObject(learningObjectID: string): void {
        this.store.dispatch(new CartActions.AddLearningObject(learningObjectID));
    }
    /**
     * Returns Array of LearningObject IDs from Redux Store
     * 
     * @returns {Promise<Array<string>>} 
     * @memberof CartService
     */
    async getLearningObjects(): Promise<Array<string>> {
        let learningObjectIDs;
        await this.cart$
            .subscribe((cart) => {
                learningObjectIDs = cart.items;
            });
        return learningObjectIDs;
    }
    /**
     * Removes LearningObject's ID from Cart via Redux Store
     * 
     * @param {string} learningObjectID 
     * @memberof CartService
     */
    removeLearningObject(learningObjectID: string): void {
        this.store.dispatch(new CartActions.RemoveLearningObject(learningObjectID));
    }
    /**
     * Removes all LearningObject IDs from Cart via Redux Store
     * 
     * @memberof CartService
     */
    clearCart(): void {
        this.store.dispatch(new CartActions.Clear());
    }

}