// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  apiURL: 'http://clark-gateway:3000',
  STATE_STORAGE_LOCATION: 'state',
  suggestionUrl: 'http://outcome-suggestion-service:7000',
  contentManagerURL: 'http://learning-object-service:5000',
  adminAppUrl: 'http://localhost:4100'
};

export enum LearningObjectStatus {
  PUBLISHED = 'published',
  UNDER_REVIEW = 'review',
  WAITING = 'waiting',
  DENIED = 'denied',
  UNPUBLISHED = 'unpublished'
}
