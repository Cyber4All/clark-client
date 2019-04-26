export interface FileUploadMeta {
  name: string;
  fileType: string;
  fullPath: string;
  size: number;
}

export interface UploadUpdate {
  type: 'progress' | 'complete' | 'queueComplete' | 'error';
  data?: any;
}

export interface UploadProgressUpdate extends UploadUpdate {
  type: 'progress';
  data: FileUploadMeta & { progress: number; totalUploaded: number };
}

export interface UploadCompleteUpdate extends UploadUpdate {
  type: 'complete';
  data: FileUploadMeta & { url: string; eTag: string };
}

export interface UploadQueueCompleteUpdate extends UploadUpdate {
  type: 'queueComplete';
  data: { successful: number; failed: number };
}

export interface UploadErrorUpdate extends UploadUpdate {
  type: 'error';
  data: FileUploadMeta;
  error: Error;
}

export interface QueueStatus {
  successful: number;
  failed: number;
  remaining: number;
}

export interface EnqueueStatus {
  enqueued: number;
}

export enum UploadErrorReason {
  Credentials = 'CredentialsError'
}
