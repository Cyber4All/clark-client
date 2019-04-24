import * as AWS from 'aws-sdk';

import { Injectable } from '@angular/core';
import { USER_ROUTES } from '@env/route';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { retry, catchError } from 'rxjs/operators';
import { throwError, Subject, Observable } from 'rxjs';
import { LearningObject } from '@entity';
import { environment } from '@env/environment';
import { WebkitFile } from '../upload/upload.component';
import { AuthService, OpenIdToken } from 'app/core/auth.service';

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

@Injectable()
export class FileManagementService {
  private S3: AWS.S3;

  constructor(private http: HttpClient, private auth: AuthService) {}

  /**
   * Uploads files to S3
   *
   * @param {string} bucketPath [The path within the bucket to upload files to]
   * @param {WebkitFile[]} files [List of files to upload]
   * @returns {Observable<UploadUpdate>}
   * @memberof FileManagementService
   */
  upload(bucketPath: string, files: WebkitFile[]): Observable<UploadUpdate> {
    if (!bucketPath) {
      throw new Error('bucketPath must be set!');
    }
    this.buildS3Client();
    const uploadUpdate$ = new Subject<UploadUpdate>();
    this.processUploads(files, bucketPath, uploadUpdate$);
    return uploadUpdate$;
  }

  /**
   * Processes upload requests and tracks upload updates such as progress, completions, and errors
   *
   * @private
   * @param {WebkitFile[]} files [List of files to upload]
   * @param {string} bucketPath [The path within the bucket to upload files to]
   * @param {Subject<UploadUpdate>} uploadUpdate$
   * @memberof FileManagementService
   */
  private processUploads(
    files: WebkitFile[],
    bucketPath: string,
    uploadUpdate$: Subject<UploadUpdate>
  ) {
    let successful = 0;
    let failed = 0;
    let remainingUploads = files.length;
    files.forEach(file => {
      const fileMeta: FileUploadMeta = {
        name: file.name,
        fileType: file.type,
        fullPath: file.fullPath || file.webkitRelativePath || file.name,
        size: file.size
      };
      const params = {
        Bucket: environment.s3Bucket,
        Key:
          bucketPath +
          '/' +
          (file.fullPath || file.webkitRelativePath || file.name),
        ContentType: file.type,
        Body: file
      };
      this.S3.upload(
        params,
        (err: Error, res: AWS.S3.ManagedUpload.SendData) => {
          if (err) {
            this.handleUploadError(err, fileMeta, uploadUpdate$);
            failed++;
          } else {
            const complete: UploadCompleteUpdate = {
              type: 'complete',
              data: { ...fileMeta, url: res.Location, eTag: res.ETag }
            };
            uploadUpdate$.next(complete);
            successful++;
          }
          remainingUploads--;
          if (remainingUploads === 0) {
            uploadUpdate$.next({
              type: 'queueComplete',
              data: { successful, failed }
            });
          }
        }
      ).on('httpUploadProgress', evt => {
        const progress: UploadProgressUpdate = {
          type: 'progress',
          data: {
            ...fileMeta,
            progress: (evt.loaded / evt.total) * 100,
            totalUploaded: evt.loaded
          }
        };
        uploadUpdate$.next(progress);
      });
    });
  }

  /**
   * Handles errors that occur when uploading file
   * If error is Credential related; Error is thrown to prevent upload attempts from continuing
   * All errors are emitted through uploadUpdate
   *
   * @private
   * @param {Error} err [The Error object]
   * @param {FileUploadMeta} fileMeta [Metadata about the file being uploaded during error]
   * @param {Subject<UploadUpdate>} uploadUpdate$ [Subject used to emit Upload Error Update]
   * @memberof FileManagementService
   */
  private handleUploadError(
    err: Error,
    fileMeta: FileUploadMeta,
    uploadUpdate$: Subject<UploadUpdate>
  ) {
    if (err.name === 'CredentialsError') {
      const credentialsErrorUpdate: UploadErrorUpdate = {
        type: 'error',
        error: err,
        data: fileMeta
      };
      uploadUpdate$.next(credentialsErrorUpdate);
      throw err;
    }
    const errorUpdate: UploadErrorUpdate = {
      type: 'error',
      error: err,
      data: fileMeta
    };
    uploadUpdate$.next(errorUpdate);
  }

  /**
   * Configures S3 Sdk for upload using user's Cognito credentials
   *
   * @private
   * @memberof FileManagementService
   */
  private buildS3Client() {
    const openIdToken: OpenIdToken = this.auth.getOpenIdToken();
    const Logins = {};
    Logins['cognito-identity.amazonaws.com'] = openIdToken.Token;
    const IdentityPoolId = this.auth.isAdminOrEditor()
      ? environment.cognitoAdminIdentityPoolId
      : environment.cognitoIdentityPoolId;
    const IdentityId = openIdToken.IdentityId;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials(
      {
        IdentityPoolId,
        IdentityId,
        Logins
      },
      { region: environment.cognitoRegion }
    );
    this.S3 = new AWS.S3({ region: environment.s3BucketRegion });
  }

  /**
   * Sends learning object ID and file name to API for deletion.
   *
   * @param {string} learningObjectID
   * @param {string} filename
   * @returns {Promise<{}>}
   * @memberof FileManagementService
   */
  delete(learningObject: LearningObject, fileId: string): Promise<{}> {
    const route = USER_ROUTES.DELETE_FILE_FROM_LEARNING_OBJECT(
      learningObject.author.username,
      learningObject.id,
      fileId
    );

    return this.http
      .delete(route, { withCredentials: true, responseType: 'text' })
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
  }

  private handleError(error: HttpErrorResponse) {
    if (
      error.error instanceof ErrorEvent ||
      (error.error && error.error.message)
    ) {
      // Client-side or network returned error
      return throwError(error.error.message);
    } else {
      // API returned error
      return throwError(error);
    }
  }
}
