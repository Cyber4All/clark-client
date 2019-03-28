import { LearningObject } from '@entity';

/**
 * Breaks Path string into array of paths. Removes last element assuming last element is file name.
 *
 * @private
 * @param {string} path
 * @returns {string[]}
 * @memberof UploadComponent
 */
export function getPaths(path: string, removeLast: boolean = true): string[] {
  const paths: string[] = path.split('/');
  if (paths[0] === '') {
    paths.shift();
  }
  // Remove file
  if (removeLast) {
    paths.pop();
  }
  return paths;
}

/**
 * Gets file extension
 *
 * @export
 * @param {LearningObject.Material.File} file
 * @returns
 */
export function getExtension(file: LearningObject.Material.File) {
  let ext = file.extension;
  if (!ext) {
    const extMatch = file.name.match(/(\.[^.]*$|$)/);
    ext = extMatch ? extMatch[0] : '';
  }
  return ext;
}

const viewableInBrowser = ['.pdf'];

/**
 * Checks if extension is in the viewableInBrowser array
 *
 * @export
 * @param {string} extension
 * @returns
 */
export function canViewInBrowser(file: LearningObject.Material.File) {
  return viewableInBrowser.includes(getExtension(file));
}
