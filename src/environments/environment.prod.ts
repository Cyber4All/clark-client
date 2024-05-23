export const environment = {
  production: true,
  experimental: false,
  apiURL: 'https://api-gateway.clark.center',
  STATE_STORAGE_LOCATION: 'state',
  suggestionUrl: 'https://api-outcome-suggestion.clark.center',
  contentManagerURL: 'https://api-learning-objects.clark.center',
  contentManagerURLAdmin: 'https://api-file-upload.clark.center',
  adminAppUrl: 'https://admin.clark.center',
  utilityWebsocket: 'wss://api-utilities.clark.center',
  clarkReportsUrl: '',
  s3Bucket: 'clark-prod-file-uploads',
  s3BucketRegion: 'us-east-1',
  cognitoRegion: 'us-east-1',
  cognitoIdentityPoolId: 'us-east-1:1ad4e60a-9773-4a67-92b5-6cc2c7b3328f',
  cognitoAdminIdentityPoolId: 'us-east-1:6691336e-11a1-48db-9774-5f5a2c8dc270',
  cardOrganizationUrl: 'https://api-gateway.caeresource.directory/organizations?type=&verified=verified&mine=&sort=',
  cardUrl: 'https://api-gateway.caeresource.directory',
};

export enum LearningObjectStatus {
  PUBLISHED = 'published',
  UNDER_REVIEW = 'review',
  WAITING = 'waiting',
  DENIED = 'denied',
  UNPUBLISHED = 'unpublished'
}
