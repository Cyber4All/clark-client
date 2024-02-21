import { environment } from '@env/environment';

export const RATING_ROUTES = {
  //Rating Routes
  //GET
  GET_RATINGS: `${environment.apiURL}/ratings`,

  //GET
  GET_LEARNING_OBJECT_RATINGS(params: {
    CUID: string;
    version: number;
  }): string {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      params.CUID
    )}/version/${encodeURIComponent(params.version.toString())}/ratings`;
  },

  //POST, AUTH REQUIRED
  CREATE_RATING(params: { CUID: string; version: number }) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      params.CUID
    )}/version/${encodeURIComponent(params.version.toString())}/ratings`;
  },

  //PATCH, AUTH REQUIRED
  EDIT_RATING(params: {
    CUID: string;
    version: number;
    ratingId: string;
  }): string {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      params.CUID
    )}/version/${encodeURIComponent(
      params.version.toString()
    )}/ratings/${encodeURIComponent(params.ratingId)}`;
  },

  //DELETE, AUTH REQUIRED
  DELETE_RATING(params: { CUID: string; version: number; ratingId: string }) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      params.CUID
    )}/version/${encodeURIComponent(
      params.version.toString()
    )}/ratings/${encodeURIComponent(params.ratingId)}`;
  },

  // Responses Routes
  //GET
  GET_RESPONSE(params: { responseId: string }): string {
    return `${
      environment.apiURL
    }/learning-objects/ratings/responses/${encodeURIComponent(
      params.responseId
    )}`;
  },

  //POST, AUTH REQUIRED
  CREATE_RESPONSE(params: { ratingId: string }): string {
    return `${environment.apiURL}/learning-objects/ratings/${encodeURIComponent(
      params.ratingId
    )}/responses`;
  },

  //PATCH, AUTH REQUIRED
  UPDATE_RESPONSE(params: { responseId: string }): string {
    return `${
      environment.apiURL
    }/learning-objects/ratings/responses/${encodeURIComponent(
      params.responseId
    )}`;
  },

  //DELETE, AUTH REQUIRED
  DELETE_RESPONSE(params: { responseId: string }): string {
    return `${
      environment.apiURL
    }/learning-objects/ratings/responses/${encodeURIComponent(
      params.responseId
    )}`;
  },

  //Flag Routes
  //GET, AUTH REQUIRED
  GET_FLAG(params: { ratingID: string }): string {
    return `${environment.apiURL}/ratings/${encodeURIComponent(
      params.ratingID
    )}/flags`;
  },

  //POST, AUTH REQUIRED
  FLAG_LEARNING_OBJECT_RATING(params: { ratingId: string }): string {
    return `${environment.apiURL}/ratings/${encodeURIComponent(
      params.ratingId
    )}/flags`;
  },

  //DELETE, AUTH REQUIRED
  DELETE_FLAG(params: { ratingID: string; flagId: string }): string {
    return `${environment.apiURL}/ratings/${encodeURIComponent(
      params.ratingID
    )}/flags/${encodeURIComponent(params.flagId)}`;
  },
};
