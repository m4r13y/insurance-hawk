import { Storage, Bucket } from '@google-cloud/storage';

let publicBucket: Bucket | null = null;
let userBucket: Bucket | null = null;

const storage = new Storage();

export function getPublicBucket(): Bucket {
  if (!publicBucket) {
    const publicBucketName = process.env.PUBLIC_BUCKET_NAME; // Or a hardcoded name if preferred
    if (!publicBucketName) {
      throw new Error('PUBLIC_BUCKET_NAME environment variable is not set.');
    }
    publicBucket = storage.bucket(publicBucketName);
  }
  return publicBucket;
}

export function getUserBucket(): Bucket {
  if (!userBucket) {
    const userBucketName = process.env.USER_BUCKET_NAME; // Or a hardcoded name if preferred
    if (!userBucketName) {
      throw new Error('USER_BUCKET_NAME environment variable is not set.');
    }
    userBucket = storage.bucket(userBucketName);
  }
  return userBucket;
}
