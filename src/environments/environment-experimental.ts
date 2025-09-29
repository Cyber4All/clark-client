// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  environment: 'experimental',
  experimental: true,
  apiURL: 'http://localhost:3001',
  s3Bucket: 'neutrino-file-uploads',
  s3BucketRegion: 'us-east-2',
  cognitoRegion: 'us-east-1',
  cognitoIdentityPoolId: '',
  cognitoAdminIdentityPoolId: '',
  cardUrl: '',
  publicKey: '',
};

export enum LearningObjectStatus {
  PUBLISHED = 'published',
  UNDER_REVIEW = 'review',
  WAITING = 'waiting',
  DENIED = 'denied',
  UNPUBLISHED = 'unpublished'
}
