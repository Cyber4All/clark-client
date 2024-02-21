import { environment } from '@env/environment';

export const FEATURED_ROUTES = {
  // PATCH, AUTH REQUIRED
  SET_FEATURED: `${environment.apiURL}/featured/learning-objects`,
  // GET
  GET_FEATURED: `${environment.apiURL}/featured/learning-objects`,
  // GET
  GET_COLLECTION_FEATURED(collection: string) {
    return `${
      environment.apiURL
    }/featured/learning-objects/${encodeURIComponent(collection)}`;
  },
  // PATCH, AUTH REQUIRED
  SET_COLLECTION_FEATURED(collection: string) {
    return `${
      environment.apiURL
    }/featured/learning-objects/${encodeURIComponent(collection)}`;
  },
};
