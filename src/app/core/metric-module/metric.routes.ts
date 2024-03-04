import { environment } from '@env/environment';

export const METRIC_ROUTES = {
  /**
   * Request to get collection metrics
   * @returns CollectionMetrics object containing metrics for the given collection
   */
  GET_COLLECTION_METRICS(abvCollectionName: string) {
    return `${environment.apiURL}/metrics&collection=${abvCollectionName}`;
  },
  /**
   * Gets learning object metrics
   * @returns metrics for one learning object or all released learning objects
   */
  GET_LEARNING_OBJECT_METRICS() {
    return `${environment.apiURL}/learning-objects/metrics`;
  },
  /**
   * Gets the total number of users and organizations in the database
   * @returns UserMetrics object containing the total number of users and organizations
   */
  GET_USER_METRICS() {
    return `${environment.apiURL}/users/metrics`;
  },
  /**
   * Request to get all learning object stats
   * @method GET
   */
  GET_LEARNING_OBJECT_STATS() {
    return `${environment.apiURL}/learning-objects/stats`;
  },
};
