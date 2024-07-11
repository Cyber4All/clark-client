export const environment = {
  production: true,
  experimental: false,
  apiURL: 'https://api.yeetbot.click',
  suggestionUrl: 'https://api.yeetbot.click', // TODO: Remove from client; delete env
  s3Bucket: 'clark-staging-file-uploads',
  s3BucketRegion: 'us-east-1',
  cognitoRegion: 'us-east-1',
  cognitoIdentityPoolId: 'us-east-1:3388292f-c48a-4257-aa55-d1816617b38f',
  cognitoAdminIdentityPoolId: 'us-east-1:a265148e-7418-4a40-aee2-78f5ae7cbf43',
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
