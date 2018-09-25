// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  apiURL: 'http://localhost:3000',
  STATE_STORAGE_LOCATION: 'state',
  suggestionUrl: 'http://localhost:7000',
  contentManagerURL: 'http://localhost:5000',
  whiteListURL:
    'https://raw.githubusercontent.com/Cyber4All/clark-client/master/whitelist/whitelist.json'
};

export enum LearningObjectStates {
  PUBLISHED = 'published',
  UNDER_REVIEW = 'review',
  WAITING = 'waiting',
  DENIED = 'denied',
  UNPUBLISHED = 'unpublished'
}
