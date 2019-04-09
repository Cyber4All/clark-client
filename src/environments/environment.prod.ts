export const environment = {
  production: true,
  apiURL: 'http://localhost:3000',
  STATE_STORAGE_LOCATION: 'state',
  suggestionUrl: 'https://api-outcome-suggestion.clark.center',
  contentManagerURL: 'https://api-learning-objects.clark.center',
  adminAppUrl: 'https://admin.clark.center'
};

export enum LearningObjectStatus {
  PUBLISHED = 'published',
  UNDER_REVIEW = 'review',
  WAITING = 'waiting',
  DENIED = 'denied',
  UNPUBLISHED = 'unpublished'
}