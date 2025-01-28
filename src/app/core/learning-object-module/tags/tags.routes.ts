import { environment } from '../../../../environments/environment';

export const TAGS_ROUTES = {
  /**
   * Route to retrieve a list of tags.
   * @returns {Tag[]} a list of tags
   */
  GET_TAGS() {
    return `${environment.apiURL}/tags`;
  },

  /**
   * Route to retrieve a list of tags.
   * @returns {Tag[]} a list of tags
   */
  GET_TAG_TYPES() {
    return `${environment.apiURL}/tags/types`;
  }
};
