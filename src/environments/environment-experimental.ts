/* eslint-disable @typescript-eslint/naming-convention */// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  experimental: true,
  apiURL: 'http://localhost:3001',
  STATE_STORAGE_LOCATION: 'state',
  suggestionUrl: 'http://localhost:7000',
  contentManagerURL: 'http://localhost:5000',
  contentManagerURLAdmin: 'http://localhost:5100',
  adminAppUrl: 'http://localhost:4100',
  utilityWebsocket: 'ws://localhost:9000',
  s3Bucket: 'neutrino-file-uploads',
  s3BucketRegion: 'us-east-2',
  cognitoRegion: 'us-east-1',
  cognitoIdentityPoolId: 'us-east-1:08c3533f-4e0b-4014-9bfe-12a347cb6272',
  cognitoAdminIdentityPoolId: 'us-east-1:eed740a1-fea5-474d-8f57-0036b1871693',
};

export enum LearningObjectStatus {
  PUBLISHED = 'published',
  UNDER_REVIEW = 'review',
  WAITING = 'waiting',
  DENIED = 'denied',
  UNPUBLISHED = 'unpublished'
}
