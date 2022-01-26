export const environment = {
  production: true,
  experimental: false,
  apiURL: 'https://api-gateway-dev.clark.center',
  STATE_STORAGE_LOCATION: 'state',
  suggestionUrl: 'https://api-guidelines-dev.clark.center',
  contentManagerURL: 'localhost',
  contentManagerURLAdmin: 'localhost',
  adminAppUrl: 'https://admin.clark.center',
  s3Bucket: 'clark-prod-file-uploads-backup',
  s3BucketRegion: 'us-east-1',
  cognitoRegion: 'us-east-1',
  cognitoIdentityPoolId: 'us-east-1:08c3533f-4e0b-4014-9bfe-12a347cb6272',
  cognitoAdminIdentityPoolId: 'us-east-1:eed740a1-fea5-474d-8f57-0036b1871693'
};

export enum LearningObjectStatus {
  PUBLISHED = 'published',
  UNDER_REVIEW = 'review',
  WAITING = 'waiting',
  DENIED = 'denied',
  UNPUBLISHED = 'unpublished'
}
