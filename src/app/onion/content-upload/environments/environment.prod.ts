import { USER_ROUTES } from '@env/route';

export const environment = {
  production: true,
  DROPZONE_CONFIG: {
    url: USER_ROUTES.POST_FILE_TO_LEARNING_OBJECT(''),
    maxFilesize: 100000000,
    acceptedFiles: '',
    autoQueue: true,
    withCredentials: true,
    chunking: true,
    // 10MB Chunk Size
    chunkSize: 10000000
  }
};
