import { environment } from '@env/environment';

export const ACCESS_GROUP_ROUTES = {
  /**
   * Request to retrieve the access groups for the given user
   * @param id user id
   * @method GET
   * @auth required
   * @returns the access groups for the given user
   */
  GET_USER_ACCESS_GROUPS(id: string) {
    return `${environment.apiURL}/access-groups/users/${encodeURIComponent(
      id
    )}`;
  },
  /**
   * Request to add a single access group from a user
   * @param username username of the user
   * @method POST
   * @auth required
   */
  ADD_ACCESS_GROUP_TO_USER(username: string) {
    return `${environment.apiURL}/access-groups/users/${encodeURIComponent(
      username
    )}`;
  },
  /**
   * Request to add a single access group from a user
   * @param username username of the user
   * @method PATCH
   * @auth required
   */
  REMOVE_ACCESS_GROUP_FROM_USER(username: string) {
    return `${environment.apiURL}/access-groups/users/${encodeURIComponent(
      username
    )}`;
  },
  
  /**
   * Request to get the users with a role in the given collection
   * @param collectionAbvName the abbreviated name of the collection
   * @param accessGroup the string representation of the access group
   * @method GET
   * @auth required
   * @returns Promise<User[]> the users with access to the given collection
   */
  GET_USERS_WITH_ACCESS_TO_COLLECTION(collectionAbvName: string, accessGroup: string) {
    return `${environment.apiURL
      }/access-groups/collections/${encodeURIComponent(collectionAbvName)}/users?role=${accessGroup}`;
  },
};
