export const environment = {
  production: true,
  experimental: false,
  environment: 'production',
  apiURL: 'https://api.clark.center',
  s3Bucket: 'clark-prod-file-uploads',
  s3BucketRegion: 'us-east-1',
  cognitoRegion: 'us-east-1',
  cognitoIdentityPoolId: 'us-east-1:1ad4e60a-9773-4a67-92b5-6cc2c7b3328f',
  cognitoAdminIdentityPoolId: 'us-east-1:6691336e-11a1-48db-9774-5f5a2c8dc270',
  cardUrl: 'https://api.clark.center',
  downtimeUrl:
    'https://oyrmr4e2d5nwt3l33ifk4ezgcq0mhnax.lambda-url.us-east-1.on.aws',
};

export enum LearningObjectStatus {
  PUBLISHED = 'published',
  UNDER_REVIEW = 'review',
  WAITING = 'waiting',
  DENIED = 'denied',
  UNPUBLISHED = 'unpublished',
}
