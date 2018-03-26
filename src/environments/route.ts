import { environment } from './environment';

export const USER_ROUTES = {
  LOGIN: `${environment.apiURL}/users/tokens`,
  REGISTER: `${environment.apiURL}/users`,
  EDIT_USER_INFO: `${environment.apiURL}/users`,
  CHECK_USER_EXISTS(username) {
    return `${environment.apiURL}/users/search?username=${username}`;
  },
  VALIDATE_TOKEN(username) {
    return `${environment.apiURL}/users/${username}/tokens`;
  },
  LOGOUT(username) {
    return `${environment.apiURL}/users/${username}/tokens`;
  },
  GET_MY_LEARNING_OBJECTS(username) {
    // Onion
    return `${environment.apiURL}/users/${username}/learning-objects`;
  },
  ADD_TO_MY_LEARNING_OBJECTS(username) {
    return `${environment.apiURL}/users/${username}/learning-objects`;
  },
  UPDATE_MY_LEARNING_OBJECT(username, learningObjectName) {
    return `${
      environment.apiURL
    }/users/${username}/learning-objects/${learningObjectName}`;
  },
  PUBLISH_LEARNING_OBJECT(username, learningObjectName) {
    return `${
      environment.apiURL
    }/users/${username}/learning-objects/${learningObjectName}/publish`;
  },
  UNPUBLISH_LEARNING_OBJECT(username, learningObjectName) {
    return `${
      environment.apiURL
    }/users/${username}/learning-objects/${learningObjectName}/unpublish`;
  },
  GET_LEARNING_OBJECT(username, learningObjectName) {
    return `${
      environment.apiURL
    }/users/${username}/learning-objects/${learningObjectName}`;
  },
  DELETE_LEARNING_OBJECT(username, learningObjectName) {
    return `${
      environment.apiURL
    }/users/${username}/learning-objects/${learningObjectName}`;
  },
  DELETE_MULTIPLE_LEARNING_OBJECTS(username, learningObjectNames) {
    return `${
      environment.apiURL
    }/users/${username}/learning-objects/multiple/${learningObjectNames}`;
  },
  POST_FILE_TO_LEARNING_OBJECT: `${environment.contentManagerURL}/files`,
  DELETE_FILE_FROM_LEARNING_OBJECT(username, learningObjectName, filename) {
    return `${
      environment.apiURL
    }/users/${username}/learning-objects/${learningObjectName}/files/${filename}`;
  },
  GET_CART(username) {
    // CUBE
    return `${environment.apiURL}/users/${username}/cart`;
  },
  CLEAR_CART(username) {
    return `${environment.apiURL}/users/${username}/cart`;
  },
  CLEAR_LEARNING_OBJECT_FROM_CART(username, author, learningObjectName) {
    return `${
      environment.apiURL
    }/users/${username}/cart/learning-objects/${author}/${learningObjectName}`;
  },
  ADD_LEARNING_OBJECT_TO_CART(username, author, learningObjectName) {
    return `${
      environment.apiURL
    }/users/${username}/cart/learning-objects/${author}/${learningObjectName}`;
  },
  DOWNLOAD_OBJECT(username, author, learningObjectName) {
    return `${
      environment.apiURL
    }/users/${username}/library/learning-objects/${author}/${learningObjectName}`;
  },
  GET_SAME_ORGANIZATION(organization) {
    return `${environment.apiURL}/users/search?organization=${organization}`;
  },
  VALIDATE_CAPTCHA() {
    return `${environment.apiURL}/users/validate-captcha`;
  }
};

export const PUBLIC_LEARNING_OBJECT_ROUTES = {
  GET_PUBLIC_LEARNING_OBJECTS: `${environment.apiURL}/learning-objects`,
  GET_PUBLIC_LEARNING_OBJECTS_WITH_FILTER(query) {
    return `${environment.apiURL}/learning-objects?${query}`;
  },
  GET_PUBLIC_LEARNING_OBJECT(author, learningObjectName) {
    return `${
      environment.apiURL
    }/learning-objects/${author}/${learningObjectName}`;
  },
  GET_COLLECTION(name: string) {
    return `${environment.apiURL}/collections/${name}/learning-objects`;
  },
  GET_USERS_PUBLIC_LEARNING_OBJECTS(username: string) {
    return `${environment.apiURL}/learning-objects/${username}`;
  },
};

export const MISC_ROUTES = {
  CHECK_STATUS: `${environment.apiURL}/status`
}
