import { environment } from '../../../../environments/environment';

export type MaterialsFilter = 'released' | 'unreleased';

export const FILE_METADATA_ROUTES = {
  GET_LEARNING_OBJECT_FILE_METADATA(learningObjectId: string) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      learningObjectId,
    )}/materials/files`;
  },

  ADD_LEARNING_OBJECT_FILE_METADATA(learningObjectId: string) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      learningObjectId,
    )}/materials/files`;
  },

  UPDATE_LEARNING_OBJECT_FILE_METADATA(learningObjectId: string, fileId: string) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      learningObjectId,
    )}/materials/files/${encodeURIComponent(fileId)}`;
  },

  DELETE_LEARNING_OBJECT_FILE_METADATA(learningObjectId: string, fileId: string) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      learningObjectId,
    )}/materials/files/${encodeURIComponent(fileId)}`;
  },
}

export const FILE_MANAGER_ROUTES = {
  DOWNLOAD_FILE(learningObjectId: string, fileId: string) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      learningObjectId,
    )}/files/${encodeURIComponent(fileId)}/download`;
  },

  UPDATE_BUNDLE(learningObjectId: string) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      learningObjectId,
    )}/files/bundle`;
  },

  UPDATE_README(learningObjectId: string) {
    return `${environment.apiURL}/learning-objects/${encodeURIComponent(
      learningObjectId,
    )}/pdf`;
  },
}
