export const environment = {
  production: false,
  environment: 'development',
  experimental: false,
  apiURL: 'http://localhost:3000',
  s3Bucket: 'clark-dev-file-uploads',
  s3BucketRegion: 'us-east-1',
  cognitoRegion: 'us-east-1',
  cognitoIdentityPoolId: '',
  cognitoAdminIdentityPoolId: '',
  cardUrl: 'http://localhost:3000',
  downtimeUrl: '',
  publicKey: 'cxtp_pbDbZsDUdNr5Wu3GWX6emisZyfKkV9',
};

export enum LearningObjectStatus {
  PUBLISHED = 'published',
  UNDER_REVIEW = 'review',
  WAITING = 'waiting',
  DENIED = 'denied',
  UNPUBLISHED = 'unpublished'
}
