import { environment } from '@env/environment';
import * as querystring from 'querystring';

export const ADMIN_ROUTES = {
  MUTATE_COLLECTION_MEMBERSHIP(
    abvCollectionName: string,
    userId: string,
  ): string {
    return `${environment.apiURL}/collections/${encodeURIComponent(
      abvCollectionName,
    )}/members/${encodeURIComponent(userId)}`;
  },
  GET_USER_ROLES(id: string): string {
    return `${environment.apiURL}/users/${encodeURIComponent(id)}/roles`;
  },
  GET_MAPPERS(): string {
    return `${environment.apiURL}/guidelines/members`;
  },
  ADD_MAPPER(userId: string): string {
    return `${environment.apiURL}/guidelines/members/${encodeURIComponent(
      userId,
    )}`;
  },
  REMOVE_MAPPER(userId: string): string {
    return `${environment.apiURL}/guidelines/members/${encodeURIComponent(
      userId,
    )}`;
  },
  CHANGE_STATUS(username: string, id: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/learning-objects/${id}/status`;
  },
  UNRELEASE_OBJECT(username: string, id: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/learning-objects/${id}/status`;
  },
  ADD_HIERARCHY_OBJECT(username) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/hierarchy-object`;
  },
};

export const COLLECTIONS_ROUTES = {
  GET_COLLECTION_CURATORS(name: string) {
    return `${environment.apiURL}/users/curators/${encodeURIComponent(name)}`;
  },
};

export const USER_ROUTES = {
  ASSIGN_COLLECTION_MEMBER(collection: string, memberId: string) {
    return `${environment.apiURL}/collections/${encodeURIComponent(
      collection,
    )}/members/${encodeURIComponent(memberId)}`;
  },
  UPDATE_COLLECTION_MEMBER(collection: string, memberId: string) {
    return `${environment.apiURL}/collections/${encodeURIComponent(
      collection,
    )}/members/${encodeURIComponent(memberId)}`;
  },

  REMOVE_COLLECTION_MEMBER(collection: string, memberId: string) {
    return `${environment.apiURL}/collections/${encodeURIComponent(
      collection,
    )}/members/${encodeURIComponent(memberId)}`;
  },
  // Route still available in gateway to LOS
  LOAD_USER_PROFILE(username: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/learning-objects/profile`;
  },
  SEARCH_USERS(query: any) {
    return `${environment.apiURL}/users/search?${querystring.stringify(query)}`;
  },
  GET_MY_LEARNING_OBJECTS(
    username,
    filters: any,
    query: string,
    childId?: string,
  ) {
    // Onion
    let uri = `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/learning-objects?children=true&text=${encodeURIComponent(
      query,
    )}&${querystring.stringify(filters)}`;
    if (childId) {
      uri = uri + `&currentId=${encodeURIComponent(childId)}`;
    }
    return uri;
  },
  GET_MY_DRAFT_LEARNING_OBJECTS(username, filters: any, query: string) {
    // Onion Dashboard
    return `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/learning-objects?text=${encodeURIComponent(
      query,
    )}&${querystring.stringify(filters)}&draftsOnly=true`;
  },
  GET_LEARNING_OBJECT_REVISION(username, learningObjectId, revisionId) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/learning-objects/${encodeURIComponent(
      learningObjectId,
    )}/revisions/${encodeURIComponent(revisionId)}`;
  },
  ADD_TO_MY_LEARNING_OBJECTS(username) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/learning-objects`;
  },
  UPDATE_MY_LEARNING_OBJECT(username, learningObjectName) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/learning-objects/${encodeURIComponent(learningObjectName)}`;
  },
  CHECK_FIRST_SUBMISSION(params: {
    userId: string;
    learningObjectId: string;
    query: {
      collection: string;
      hasSubmission: boolean;
    };
  }) {
    const q =
      'collection=' +
      params.query.collection +
      '&hasSubmission=' +
      params.query.hasSubmission;
    return `${environment.apiURL}/users/${encodeURIComponent(
      params.userId,
    )}/learning-objects/${params.learningObjectId}/submissions?${q}`;
  },
  GET_LEARNING_OBJECT(id) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(id)}`;
  },
  DELETE_LEARNING_OBJECT(username: string, id: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/learning-objects/${encodeURIComponent(id)}`;
  },
  DELETE_MULTIPLE_LEARNING_OBJECTS(username, learningObjectNames) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/learning-objects/multiple/${encodeURIComponent(learningObjectNames)}`;
  },
  POST_MAPPING(username: string, learningObjectId: string, outcomeId: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/learning-objects/${encodeURIComponent(
      learningObjectId,
    )}/outcomes/${encodeURIComponent(outcomeId)}/mappings`;
  },
  DELETE_MAPPING(
    username: string,
    learningObjectId: string,
    outcomeId: string,
    mappingsId: string,
  ) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/learning-objects/${encodeURIComponent(
      learningObjectId,
    )}/outcomes/${encodeURIComponent(outcomeId)}/mappings/${encodeURIComponent(
      mappingsId,
    )}`;
  },
  // FIXME: This route is not in the gateway
  GET_SAME_ORGANIZATION(organization) {
    return `${environment.apiURL
      }/users/search?organization=${encodeURIComponent(organization)}`;
  },
  /** ROUTE NOT IN GATEWAY */
  VALIDATE_CAPTCHA() {
    return `${environment.apiURL}/users/validate-captcha`;
  },
  SET_CHILDREN(username, learningObjectName) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      username,
    )}/${encodeURIComponent(learningObjectName)}/children`;
  },
  GET_CHILDREN(username: string, learningObjectID: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/learning-objects/${encodeURIComponent(learningObjectID)}/children`;
  },
};

export const PUBLIC_LEARNING_OBJECT_ROUTES = {
  GET_PUBLIC_LEARNING_OBJECTS: `${environment.apiURL}/learning-objects`,
  GET_PUBLIC_LEARNING_OBJECTS_WITH_FILTER(query) {
    return `${environment.apiURL}/learning-objects?${query}`;
  },
  GET_PUBLIC_LEARNING_OBJECT(author: string, cuid: string, version?: number) {
    let uri = `${environment.apiURL}/users/${encodeURIComponent(
      author,
    )}/learning-objects/${encodeURIComponent(cuid)}`;

    if (version !== undefined) {
      uri += '?version=' + version.toString();
    }

    return uri;
  },
  GET_LEARNING_OBJECT_PARENTS(username: string, id: string) {
    return `${environment.apiURL}/users/${username}/learning-objects/${id}/parents`;
  },
  DOWNLOAD_FILE(params: {
    username: string;
    loId: string;
    fileId: string;
    open?: boolean;
  }) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      params.username,
    )}/learning-objects/${params.loId}/files/${params.fileId}/download${params.open ? '?open=true' : ''
      }`;
  },
};

export const FEATURED_ROUTES_OLD = {
  // Get featured objects for a specific collection
  GET_COLLECTION_FEATURED(collection: string) {
    return `${environment.apiURL
      }/featured/learning-objects?collection=${encodeURIComponent(collection)}`;
  },
};
