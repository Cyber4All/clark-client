export const environment = {
  production: true,
  apiURL: 'https://api-gateway.clark.center',
  STATE_STORAGE_LOCATION: 'state',
  suggestionUrl: 'https://api-outcome-suggestion.clark.center',
  contentManagerURL: 'https://api-learning-objects.clark.center',
  contentManagerURLAdmin: 'https://api-file-upload.clark.center',
  adminAppUrl: 'https://admin.clark.center'
};

export enum LearningObjectStatus {
  PUBLISHED = 'published',
  UNDER_REVIEW = 'review',
  WAITING = 'waiting',
  DENIED = 'denied',
  UNPUBLISHED = 'unpublished'
}
