import { environment } from './environment';

export const USER_ROUTES = {
    LOGIN: `${environment.apiURL}/users/tokens`,
    REGISTER: `${environment.apiURL}/users`,
    VALIDATE_TOKEN(username) {
        return `${environment.apiURL}/users/${username}/tokens`;
    },
    LOGOUT(username) {
        return `${environment.apiURL}/users/${username}/tokens`;
    },
    // Onion
    GET_MY_LEARNING_OBJECTS(username) {
        return `${environment.apiURL}/users/${username}/learning-objects`;
    },
    ADD_TO_MY_LEARNING_OBJECTS(username) {
        return `${environment.apiURL}/users/${username}/learning-objects`;
    },
    UPDATE_MY_LEARNING_OBJECT(username, learningObjectName) {
        return `${environment.apiURL}/users/${username}/learning-objects/${learningObjectName}`;
    },
    GET_LEARNING_OBJECT(username, learningObjectName) {
        console.log(learningObjectName);
        return `${environment.apiURL}/users/${username}/learning-objects/${learningObjectName}`;
    },
    DELETE_LEARNING_OBJECT(username, learningObjectName) {
        return `${environment.apiURL}/users/${username}/learning-objects/${learningObjectName}`;
    },
    DELETE_MULTIPLE_LEARNING_OBJECTS(username, learningObjectNames) {
        return `${environment.apiURL}/users/${username}/learning-objects/multiple/${learningObjectNames}`;
    },
    POST_FILE_TO_LEARNING_OBJECT(username, learningObjectName) {
        return `${environment.apiURL}/users/${username}/learning-objects/${learningObjectName}/files`;
    },
    DELETE_FILE_FROM_LEARNING_OBJECT(username, learningObjectID, filename) {
        return `${environment.apiURL}/users/${username}/learning-objects/${learningObjectID}/files/${filename}`;
    },
    // CUBE
    GET_CART(username) {
        return `${environment.apiURL}/users/${username}/cart`;
    },
    CLEAR_CART(username) {
        return `${environment.apiURL}/users/${username}/cart`;
    },
    CLEAR_LEARNING_OBJECT_FROM_CART(username, author, learningObjectName) {
        return `${environment.apiURL}/users/${username}/cart/learning-objects/${author}/${learningObjectName}`;
    },
    ADD_LEARNING_OBJECT_TO_CART(username, author, learningObjectName) {
        return `${environment.apiURL}/users/${username}/cart/learning-objects/${author}/${learningObjectName}`;
    }
};

export const PUBLIC_LEARNING_OBJECT_ROUTES = {
    GET_PUBLIC_LEARNING_OBJECTS: `${environment.apiURL}/learningObjects`,
    GET_PUBLIC_LEARNING_OBJECTS_WITH_FILTER(query) {
        return `${environment.apiURL}/learningObjects${query}`;
    },
    GET_PUBLIC_LEARNING_OBJECT(author, learningObjectName) {
        return `${environment.apiURL}/learning-objects/${author}/${learningObjectName}`;
    }
};
