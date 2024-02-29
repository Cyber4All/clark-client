import { environment } from '@env/environment';
import * as querystring from 'querystring';

export type MaterialsFilter = 'released' | 'unreleased';

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
  CHANGE_AUTHOR(userId: string, id: string): string {
    return `${environment.apiURL}/users/${encodeURIComponent(
      userId,
    )}/learning-objects/${id}/change-author`;
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
  DELETE_REVISION(username: string, cuid: string, version: number) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/learning-objects/${cuid}/versions/${version}`;
  },
  UPDATE_OBJECT_SUBMITTED_COLLECTION(username: string, cuid: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/learning-objects/${encodeURIComponent(cuid)}/collection`;
  },
  ADD_HIERARCHY_OBJECT(username) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/hierarchy-object`;
  },
  TOGGLE_BUNDLE(username: string, id: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/learning-objects/${encodeURIComponent(id)}/files/bundle`;
  },
};

export const CHANGELOG_ROUTES = {
  CREATE_CHANGELOG(userId: string, learningObjectCuid: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      userId,
    )}/learning-objects/${encodeURIComponent(learningObjectCuid)}/changelog`;
  },
  FETCH_ALL_CHANGELOGS(params: {
    userId: string;
    learningObjectCuid: string;
    minusRevision?: boolean;
  }) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      params.userId,
    )}/learning-objects/${encodeURIComponent(
      params.learningObjectCuid,
    )}/changelogs?minusRevision=${params.minusRevision}`;
  },
};

export const COLLECTIONS_ROUTES = {
  GET_COLLECTION_CURATORS(name: string) {
    return `${environment.apiURL}/users/curators/${encodeURIComponent(name)}`;
  },
  GET_COLLECTION_REPORT(
    collections: string[],
    date?: { start: string; end: string },
  ) {
    let route = `${environment.apiURL
      }/reports?output=csv&collection=${collections.join(',')}`;

    if (date) {
      route += `&start=${date.start}&end=${date.end}`;
    }

    return route;
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
  CREATE_REVISION_OF_LEARNING_OBJECT(username, cuid) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/learning-objects/${encodeURIComponent(cuid)}/versions`;
  },
  UPDATE_MY_LEARNING_OBJECT(username, learningObjectName) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/learning-objects/${encodeURIComponent(learningObjectName)}`;
  },
  SUBMIT_LEARNING_OBJECT(params: { userId: string; learningObjectId: string }) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      params.userId,
    )}/learning-objects/${params.learningObjectId}/submissions`;
  },
  UNSUBMIT_LEARNING_OBJECT(params: {
    userId: string;
    learningObjectId: string;
  }) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      params.userId,
    )}/learning-objects/${params.learningObjectId}/submissions`;
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
  DELETE_FILE_FROM_LEARNING_OBJECT({
    authorUsername,
    learningObjectId,
    fileId,
  }: {
    authorUsername: string;
    learningObjectId: string;
    fileId: string;
  }) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      authorUsername,
    )}/learning-objects/${encodeURIComponent(
      learningObjectId,
    )}/materials/files/${encodeURIComponent(fileId)}`;
  },
  MODIFY_MY_OUTCOME(learningObjectId: string, outcomeId: string) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      learningObjectId,
    )}/learning-outcomes/${encodeURIComponent(outcomeId)}`;
  },
  CREATE_AN_OUTCOME(learningObjectId: string) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      learningObjectId,
    )}/learning-outcomes`;
  },
  DELETE_OUTCOME(learningObjectId: string, outcomeId: string) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      learningObjectId,
    )}/learning-outcomes/${encodeURIComponent(outcomeId)}`;
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
  OBJECT_BUNDLE(username: string, learningObjectId: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/learning-objects/${encodeURIComponent(learningObjectId)}/bundle`;
  },
  GET_SAME_ORGANIZATION(organization) {
    return `${environment.apiURL
      }/users/search?organization=${encodeURIComponent(organization)}`;
  },
  VALIDATE_CAPTCHA() {
    return `${environment.apiURL}/users/validate-captcha`;
  },
  SET_CHILDREN(username, learningObjectName) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      username,
    )}/${encodeURIComponent(learningObjectName)}/children`;
  },
  UPDATE_PDF(id: string) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      id,
    )}/pdf`;
  },
  UPDATE_FILE_DESCRIPTION(username: string, objectId: string, fileId: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/learning-objects/${objectId}/materials/files/${encodeURIComponent(
      fileId,
    )}`;
  },
  GET_MATERIALS(username: string, objectId: string, filter?: MaterialsFilter) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/learning-objects/${objectId}/materials?status=${filter}`;
  },
  ADD_FILE_META(username: string, objectId: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/learning-objects/${objectId}/materials/files`;
  },
  GET_CHILDREN(username: string, learningObjectID: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/learning-objects/${encodeURIComponent(learningObjectID)}/children`;
  },
  GET_METRICS(username: string, learningObjectID: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/learning-objects/${encodeURIComponent(learningObjectID)}/metrics`;
  },
  TOGGLE_FILES_TO_BUNDLE(params: {
    username: string;
    learningObjectID: string;
  }): string {
    return `${environment.apiURL}/users/${encodeURIComponent(
      params.username,
    )}/learning-objects/${encodeURIComponent(
      params.learningObjectID,
    )}/files/bundle`;
  },
  GET_COLLECTIONS(username: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/collections`;
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
  GET_COLLECTIONS: `${environment.apiURL}/collections`,
  GET_COLLECTION_META(name: string) {
    return `${environment.apiURL}/collections/${encodeURIComponent(name)}/meta`;
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

export const STATS_ROUTES = {
  // fetches stats for all objects in the system
  LEARNING_OBJECT_STATS: `${environment.apiURL}/learning-objects/stats`,
  USERS_STATS: `${environment.apiURL}/users/stats` // nothing new
};

export const FEATURED_ROUTES_OLD = {
  // Get featured objects for a specific collection
  GET_COLLECTION_FEATURED(collection: string) {
    return `${environment.apiURL
      }/featured/learning-objects?collection=${encodeURIComponent(collection)}`;
  },
};

export const RELEVANCY_ROUTES = {
  // Sets the nextCheck date for a relevancy
  NEXT_CHECK(username: string, id: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username,
    )}/learning-objects/${encodeURIComponent(id)}/relevancy-check`;
  },
  // Assigns multiple users to evaluate multiple learning objects
  ASSIGN_EVALUATORS() {
    return `http://localhost:5000/learning-objects/evaluators`;
  },
  // Removes multiple user from evaluating multiple learning objects
  REMOVE_EVALUATORS() {
    return `http://localhost:5000/learning-objects/evaluators`;
  },
  // Reterieves topics for tagging learning objects
  GET_TOPICS() {
    return `${environment.apiURL}/topics`;
  },
  PATCH_OBJECT_TOPICS(username: string, id: string) {
    return `${environment.apiURL}/users/${username}/learning-objects/${id}/topics`;
  },
  PATCH_OBJECT_OUTCOME_MAPPINGS(
    username: string,
    objectId: string,
    outcomeId: string,
  ) {
    return `${environment.apiURL}/users/${username}/learning-objects/${objectId}/learning-outcomes/${outcomeId}/guidelines`;
  },
};
