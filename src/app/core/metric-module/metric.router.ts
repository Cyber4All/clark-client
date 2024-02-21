import { environment } from '@env/environment';

export const METRIC_ROUTES = {
  // GET
  GET_COLLECTION_METRICS: `${environment.apiURL}/metrics`,

  // GET
  LIBRARY_METRICS: `${environment.apiURL}/learning-objects/metrics`,

  // GET
  USER_METRICS: `${environment.apiURL}/users/metrics`,
};
