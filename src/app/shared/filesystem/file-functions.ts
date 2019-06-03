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

const microsoftPreviewUrl =
  'https://view.officeapps.live.com/op/embed.aspx?src=';

const previewable: { [index: string]: string[] } = {
  microsoft: [
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'odt',
    'ott',
    'oth',
    'odm'
  ],
  browser: ['pdf']
};

/**
 * Returns preview url for file based on extension
 * If the file's extension matches a Microsoft file extension, the Microsoft preview url for the file is returned
 * If the file's extension can be opened in browser, the file's url is returned
 * If the extension does not match any case, an empty string is returned.
 *
 * @export
 * @param {LearningObject.Material.File} file [Metadata of the file]
 * @returns {string} [Preview url]
 */
export function getPreviewUrl(file: LearningObject.Material.File): string {
  let url = '';
  const extension = file.extension;
  if (extension) {
    const types = Object.keys(previewable);
    for (const type of types) {
      const extensions = previewable[type];
      if (extensions.includes(extension.replace('.', ''))) {
        switch (type) {
          case 'microsoft':
            url = `${microsoftPreviewUrl}${file.url}`;
            break;
          case 'browser':
            url = file.url;
            break;
          default:
            break;
        }
        break;
      }
    }
  }
  return url;
}
