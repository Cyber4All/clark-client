import { environment } from '../../../../environments/environment';

export const TAGS_ROUTES = {
  /**
   * Route to retrieve a list of tags.
   * @returns {Tag[]} a list of tags
   */
  GET_TAGS() {
    return `${environment.apiURL}/tags`;
  }
};
