/* eslint-disable @typescript-eslint/naming-convention */
export const UPLOAD_ERRORS = {
  SERVICE_ERROR:
    'We are unable to upload files at this time. Please try again later.',
  INVALID_CREDENTIALS:
    'Unable to upload files at this time. Invalid credentials.',
  FILES_FAILED(fileNames: string): string {
    return `We were unable to upload: ${fileNames.substring(
      0,
      25
    )}... Please try again later`;
  }
};
