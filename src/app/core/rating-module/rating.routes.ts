import { environment } from '@env/environment';

export const RATING_ROUTES = {
  /**
   * Request to get all ratings for a learning object
   * @param cuid cuid of learning object
   * @param version version of learning object
   * @method GET
   * @returns ratings array
   */
  GET_LEARNING_OBJECT_RATINGS(cuid: string, version: number) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(cuid)}/version/${encodeURIComponent(version)}/ratings`;
  },

  /**
   * Request to create a rating for a learning object
   * @param CUID cuid of learning object
   * @param version version of learning object
   * @method POST
   * @auth required
   */
  CREATE_RATING(cuid: string, version: number) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(cuid)}/version/${encodeURIComponent(version)}/ratings`;
  },

  /**
   * Request to edit a rating for a learning object
   * @param cuid cuid of learning object
   * @param version version of learning object
   * @param ratingId id of rating to edit
   * @method PATCH
   * @auth required
   */
  EDIT_RATING(cuid: string, version: number, ratingId: string) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      cuid
    )}/version/${encodeURIComponent(
      version
    )}/ratings/${encodeURIComponent(
      ratingId
    )}`;
  },

  /**
   * Request to delete a rating for a learning object
   * @param cuid cuid of learning object
   * @param version version of learning object
   * @param ratingId id of rating to edit
   * @method DELETE
   * @auth required
   */
  DELETE_RATING(cuid: string, version: number, ratingId: string) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      cuid
    )}/version/${encodeURIComponent(
      version
    )}/ratings/${encodeURIComponent(
      ratingId
    )}`;
  },
  /**
   * Request to get a response by its ID
   * @param responseId id of response to get
   * @method GET
   * @returns a response
   */
  GET_RESPONSE(responseId: string) {
    return `${environment.apiURL}/learning-objects/ratings/responses/${encodeURIComponent(responseId)}`;
  },
  /**
   * Request to create a response for a rating
   * @param ratingId id of rating to create a response for
   * @method POST
   * @auth required
   */
  CREATE_RESPONSE(ratingId: string) {
    return `${environment.apiURL}/learning-objects/ratings/${encodeURIComponent(ratingId)}/responses`;
  },
  /**
   * Request to update a response
   * @param responseId id of response to update
   * @method PATCH
   * @auth required
   */
  UPDATE_RESPONSE(responseId: string) {
    return `${environment.apiURL}/learning-objects/ratings/responses/${encodeURIComponent(responseId)}`;
  },
  /**
   * Request to delete a response
   * @param responseId id of response to delete
   * @method DELETE
   * @auth required
   */
  DELETE_RESPONSE(responseId: string) {
    return `${environment.apiURL}/learning-objects/ratings/responses/${encodeURIComponent(responseId)}`;
  },
  /**
   * Request to get a flag by its Id or all flags if no Id is provided
   * @param ratingID id of rating to get flags for
   * @method GET
   * @auth required
   * @returns array of flags
   */
  // TODO: See sc-32843. Implement this on the admin side.
  GET_FLAGS(ratingID: string) {
    return `${environment.apiURL}/ratings/${encodeURIComponent(ratingID)}/flags`;
  },
  /**
   * Request to flag a rating
   * @param ratingId id of rating to flag
   * @method POST
   * @auth required
   */
  FLAG_LEARNING_OBJECT_RATING(ratingId: string) {
    return `${environment.apiURL}/ratings/${encodeURIComponent(ratingId)}/flags`;
  },
};
