export const environment = {
  production: true,
  experimental: false,
  apiURL: 'https://api.yeetbot.click',
  s3Bucket: 'clark-staging-file-uploads',
  s3BucketRegion: 'us-east-1',
  cognitoRegion: 'us-east-1',
  cognitoIdentityPoolId: 'us-east-1:3388292f-c48a-4257-aa55-d1816617b38f',
  cognitoAdminIdentityPoolId: 'us-east-1:a265148e-7418-4a40-aee2-78f5ae7cbf43',
  cardUrl: 'https://api.clark.center',
  downtimeUrl: 'https://oyrmr4e2d5nwt3l33ifk4ezgcq0mhnax.lambda-url.us-east-1.on.aws',
};

export enum LearningObjectStatus {
  PUBLISHED = 'published',
  UNDER_REVIEW = 'review',
  WAITING = 'waiting',
  DENIED = 'denied',
  UNPUBLISHED = 'unpublished'
}
