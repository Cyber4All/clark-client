import { USER_ROUTES } from '@env/route';

// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  DROPZONE_CONFIG: {
    url: USER_ROUTES.POST_FILE_TO_LEARNING_OBJECT(''),
    maxFilesize: 100000000,
    acceptedFiles: '',
    autoQueue: true,
    withCredentials: true,
    chunking: true,
    // 5MB Chunk Size
    chunkSize: 6000000,
    timeout: 900000, // 15 minutes timeout
    createImageThumbnails: false
  }
};
