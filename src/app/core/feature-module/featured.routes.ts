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
   * Request to retrieve the featured learning objects for a specific collection
   * @method GET
   * @param collectionAbvName the abbreviated name of the collection
   */
  GET_COLLECTION_FEATURED_OBJECTS(collectionAbvName: string) {
    return `${environment.apiURL}/featured/learning-objects?collection=${encodeURIComponent(collectionAbvName)}`;
  },
    /**
     * Request to retrieve the featured learning objects for a specific collection with a limit
     * @method GET
     * @param collectionAbvName the abbreviated name of the collection
     */
    GET_COLLECTION_FEATURED_OBJECTS_WITH_LIMIT(collectionAbvName: string, limit: number) {
      return `${environment.apiURL}/featured/learning-objects?collection=${encodeURIComponent(collectionAbvName)}
      &limit=${encodeURIComponent(limit)}`;
    },
  /**
   * Request to update the list of featured learning objects
   * @method PATCH
   * @auth required
   */
  UPDATE_FEATURED_OBJECTS() {
    return `${environment.apiURL}/featured/learning-objects`;
  },
  /**
   * Request to update the featured learning objects for a specific collection
   * @method PATCH
   * @auth required
   * @param collectionAbvName the abbreviated name of the collection
   */
  UPDATE_COLLECTION_FEATURED_OBJECTS(collectionAbvName: string) {
    return `${environment.apiURL}/featured/learning-objects/${encodeURIComponent(collectionAbvName)}`;
  },
};
