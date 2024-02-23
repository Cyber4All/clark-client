import { environment } from '@env/environment';

export const LIBRARY_ROUTES = {
  /**
   * Request to get saved learning objects for a users library
   * @method GET
   * @auth required
   * @param username username of the user's library
   * @returns list of saved learning objects
   */
  GET_USERS_LIBRARY(username) {
    return `${environment.apiURL}/users/${encodeURIComponent(username)}/library`;
  },
  /**
   * Request to add a learning object to a user's library
   * @method POST
   * @auth required
   * @param username username of the user's library
   */
  ADD_LEARNING_OBJECT_TO_LIBRARY(username) {
    return `${environment.apiURL}/users/${encodeURIComponent(username)}/library`;
  },
  /**
   * Request to remove a learning object from a user's library
   * @method DELETE
   * @auth required
   * @param username username of the user's library
   * @param learningObjectId cuid of the learning object to remove
   */
  REMOVE_LEARNING_OBJECT_FROM_LIBRARY(username, learningObjectId) {
    return `${environment.apiURL}/users/${encodeURIComponent(username)}/library/${encodeURIComponent(learningObjectId)}`;
  },

};
