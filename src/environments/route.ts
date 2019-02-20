import { environment } from '@env/environment';
import * as querystring from 'querystring';

export const USER_ROUTES = {
  LOGIN: `${environment.apiURL}/users/tokens`,
  REGISTER: `${environment.apiURL}/users`,
  EDIT_USER_INFO: `${environment.apiURL}/users`,
  CHECK_USER_EXISTS(username) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username
    )}/profile`;
  },
  LOAD_USER_PROFILE(username: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username
    )}/learning-objects/profile`;
  },
  SEARCH_USERS(query: {}) {
    return `${environment.apiURL}/users/search?text=` + query;
  },
  VALIDATE_TOKEN(username) {
    return `${environment.apiURL}/users/${encodeURIComponent(username)}/tokens`;
  },
  LOGOUT(username) {
    return `${environment.apiURL}/users/${encodeURIComponent(username)}/tokens`;
  },
  GET_MY_LEARNING_OBJECTS(username, query: any) {
    // Onion
    return `${environment.apiURL}/users/${encodeURIComponent(
      username
    )}/learning-objects?children=true&${querystring.stringify(query)}`;
  },
  ADD_TO_MY_LEARNING_OBJECTS(username) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username
    )}/learning-objects`;
  },
  UPDATE_MY_LEARNING_OBJECT(username, learningObjectName) {
    return `${
      environment.apiURL
    }/users/${username}/learning-objects/${encodeURIComponent(
      learningObjectName
    )}`;
  },
  SUBMIT_LEARNING_OBJECT(learningObjectId: string) {
    return `${
      environment.apiURL
    }/learning-objects/${learningObjectId}/submission`;
  },
  UNSUBMIT_LEARNING_OBJECT(learningObjectId: string) {
    return `${
      environment.apiURL
    }/learning-objects/${learningObjectId}/submission`;
  },
  ADD_LEARNING_OBJET_TO_COLLECTION(learningObjectId: string) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      learningObjectId
    )}/collections`;
  },
  GET_LEARNING_OBJECT(id) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(id)}`;
  },
  DELETE_LEARNING_OBJECT(username, learningObjectName) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username
    )}/learning-objects/${encodeURIComponent(learningObjectName)}`;
  },
  DELETE_MULTIPLE_LEARNING_OBJECTS(username, learningObjectNames) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username
    )}/learning-objects/multiple/${encodeURIComponent(learningObjectNames)}`;
  },
  POST_FILE_TO_LEARNING_OBJECT(id: string) {
    return `${environment.contentManagerURL}/learning-objects/${id}/files`;
  },
  DELETE_FILE_FROM_LEARNING_OBJECT(username, learningObjectName, id) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username
    )}/learning-objects/${encodeURIComponent(
      learningObjectName
    )}/files/${encodeURIComponent(id)}`;
  },
  MODIFY_MY_OUTCOME(learningObjectId: string, outcomeId: string) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      learningObjectId
    )}/learning-outcomes/${encodeURIComponent(outcomeId)}`;
  },
  CREATE_AN_OUTCOME(learningObjectId: string) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      learningObjectId
    )}/learning-outcomes`;
  },
  DELETE_OUTCOME(learningObjectId: string, outcomeId: string) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      learningObjectId
    )}/learning-outcomes/${encodeURIComponent(
      outcomeId
    )}`;
  },
  GET_CART(username) {
    // CUBE
    return `${environment.apiURL}/users/${encodeURIComponent(username)}/cart`;
  },
  CLEAR_CART(username) {
    return `${environment.apiURL}/users/${encodeURIComponent(username)}/cart`;
  },
  CLEAR_LEARNING_OBJECT_FROM_CART(username, author, learningObjectName) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username
    )}/cart/learning-objects/${encodeURIComponent(author)}/${encodeURIComponent(
      learningObjectName
    )}`;
  },
  ADD_LEARNING_OBJECT_TO_CART(username, author, learningObjectName) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username
    )}/cart/learning-objects/${encodeURIComponent(author)}/${encodeURIComponent(
      learningObjectName
    )}`;
  },
  DOWNLOAD_OBJECT(username, author, learningObjectName) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username
    )}/library/learning-objects/${encodeURIComponent(
      author
    )}/${encodeURIComponent(learningObjectName)}`;
  },
  GET_SAME_ORGANIZATION(organization) {
    return `${
      environment.apiURL
    }/users/search?organization=${encodeURIComponent(organization)}`;
  },
  VALIDATE_CAPTCHA() {
    return `${environment.apiURL}/users/validate-captcha`;
  },
  SET_CHILDREN(username, learningObjectName) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      username
    )}/${encodeURIComponent(learningObjectName)}/children`;
  },
  UPDATE_PDF(username: string, id: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username
    )}/learning-objects/${id}/pdf`;
  },
  UPDATE_FILE_DESCRIPTION(username: string, objectId: string, fileId: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username
    )}/learning-objects/${objectId}/files/${encodeURIComponent(fileId)}`;
  },
  GET_MATERIALS(username: string, objectId: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username
    )}/learning-objects/${objectId}/materials`;
  },
  INIT_MULTIPART(params: {
    username: string;
    objectId: string;
    fileId: string;
  }) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      params.username
    )}/learning-objects/${params.objectId}/files/${params.fileId}/multipart`;
  },
  FINALIZE_MULTIPART(params: {
    username: string;
    objectId: string;
    fileId: string;
  }) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      params.username
    )}/learning-objects/${params.objectId}/files/${params.fileId}/multipart`;
  },
  ABORT_MULTIPART(params: {
    username: string;
    objectId: string;
    fileId: string;
  }) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      params.username
    )}/learning-objects/${params.objectId}/files/${params.fileId}/multipart`;
  }
};

export const PUBLIC_LEARNING_OBJECT_ROUTES = {
  GET_PUBLIC_LEARNING_OBJECTS: `${environment.apiURL}/learning-objects`,
  GET_PUBLIC_LEARNING_OBJECTS_WITH_FILTER(query) {
    return `${environment.apiURL}/learning-objects?${query}`;
  },
  GET_PUBLIC_LEARNING_OBJECT(author, learningObjectName) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      author
    )}/${encodeURIComponent(learningObjectName)}`;
  },
  GET_COLLECTIONS: `${environment.apiURL}/collections`,
  GET_COLLECTION_META(name: string) {
    return `${environment.apiURL}/collections/${encodeURIComponent(name)}/meta`;
  },
  GET_USERS_PUBLIC_LEARNING_OBJECTS(username: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username
    )}/learning-objects`;
  },
  GET_LEARNING_OBJECT_PARENTS(id: string) {
    return `${environment.apiURL}/learning-objects/${id}/parents`;
  },
  DOWNLOAD_FILE(params: {
    username: string;
    loId: string;
    fileId: string;
    open?: boolean;
  }) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      params.username
    )}/learning-objects/${params.loId}/files/${params.fileId}/download${
      params.open ? '?open=true' : ''
    }`;
  }
};

export const RATING_ROUTES = {
  DELETE_RATING(
    learningObjectAuthor: string,
    learningObjectName: string,
    ratingId: string
  ) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      learningObjectAuthor
    )}/${encodeURIComponent(learningObjectName)}/ratings/${encodeURIComponent(
      ratingId
    )}`;
  },
  EDIT_RATING(
    learningObjectAuthor: string,
    learningObjectName: string,
    ratingId: string
  ) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      learningObjectAuthor
    )}/${encodeURIComponent(learningObjectName)}/ratings/${encodeURIComponent(
      ratingId
    )}`;
  },
  CREATE_RATING(learningObjectAuthor: string, learningObjectName: string) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      learningObjectAuthor
    )}/${encodeURIComponent(learningObjectName)}/ratings`;
  },
  GET_LEARNING_OBJECT_RATINGS(
    learningObjectAuthor: string,
    learningObjectName: string
  ) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      learningObjectAuthor
    )}/${encodeURIComponent(learningObjectName)}/ratings`;
  },
  FLAG_LEARNING_OBJECT_RATING(
    learningObjectAuthor: string,
    learningObjectName: string,
    ratingId: string
  ) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      learningObjectAuthor
    )}/${encodeURIComponent(learningObjectName)}/ratings/${encodeURIComponent(
      ratingId
    )}/flags`;
  },
  GET_USER_RATINGS(username: string) {
    return `${environment.apiURL}/users/${encodeURIComponent(
      username
    )}/ratings`;
  }
};
export const MISC_ROUTES = {
  CHECK_STATUS: `${environment.apiURL}/status`
};

export const STATS_ROUTES = {
  LEARNING_OBJECT_STATS: `${environment.apiURL}/learning-objects/stats`,
  LIBRARY_STATS: `${environment.apiURL}/library/stats`,
  USERS_STATS: `${environment.apiURL}/users/stats`
};
