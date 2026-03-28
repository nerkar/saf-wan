export type UploadPublicMediaParams = {
  /**
   * Unique object key (path-style), e.g. `products/{productId}/image-1.jpg`.
   * Avoid PII in path names for shared buckets.
   */
  pathname: string;
  body: Blob | ArrayBuffer | Buffer;
  contentType: string;
};

export type UploadPublicMediaResult = {
  url: string;
};
