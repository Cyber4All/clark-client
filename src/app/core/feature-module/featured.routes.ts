import { environment } from '@env/environment';

export const FEATURED_ROUTES = {
  /**
   * Request to retrieve a list of featured learning objects
   * @method GET
   * @returns list of featured learning objects
   */
  GET_FEATURED_OBJECTS() {
    return `${environment.apiURL}/featured/learning-objects`;
  },
  /**
   * Request to retrieve the featured learning objects for a specific collection with an optional limit
   * @method GET
   * @param collectionAbvName the abbreviated name of the collection
   * @param limit (optional) the number of featured learning objects to retrieve
   */
  GET_COLLECTION_FEATURED_OBJECTS(collectionAbvName: string, limit?: number) {
    let url = `${environment.apiURL}/featured/learning-objects?collection=${encodeURIComponent(collectionAbvName)}`;
    if (limit) {
      url += `&limit=${encodeURIComponent(limit)}`;
    }
    return url;
  },
  /**
   * Request to update the list of featured learning objects
   * @method PATCH
   * @auth required
   */
  UPDATE_FEATURED_OBJECTS() {
    return `${environment.apiURL}/featured/learning-objects`;
  },
};
