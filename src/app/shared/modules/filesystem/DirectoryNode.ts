import { LearningObject } from '@entity';

/**
 * Class representing simple Node in DirectoryTree
 *
 * @class DirectoryNode
 */

export class DirectoryNode {
  private name: string;
  private path: string;
  private files: LearningObject.Material.File[];
  private parent: DirectoryNode;
  private folders: DirectoryNode[];
  public description: string;

  private fileMap: Map<string, number> = new Map();
  private folderMap: Map<string, number> = new Map();

  constructor(name: string, path: string, parent: DirectoryNode) {
    this.name = name;
    this.path = path;
    this.files = [];
    this.parent = parent;
    this.folders = [];
    this.description = '';
  }

  /**
   * Checks if folder is empty by checking the length folders and files
   *
   * @returns {boolean}
   * @memberof DirectoryNode
   */
  public isEmpty(): boolean {
    return !this.folders.length && !this.files.length;
  }

  /**
   * Gets Parent Node
   *
   * @returns {DirectoryNode}
   * @memberof DirectoryNode
   */
  public getParent(): DirectoryNode {
    return this.parent;
  }
  /**
   * Gets Node Name
   *
   * @returns {string}
   * @memberof DirectoryNode
   */
  public getName(): string {
    return this.name;
  }
  /**
   * Get Node Path
   *
   * @returns {string}
   * @memberof DirectoryNode
   */
  public getPath(): string {
    return this.path;
  }

  /**
   * Returns folder by name
   *
   * @param {string} name [The name of the folder to return]
   * @returns {DirectoryNode}
   * @memberof DirectoryNode
   */
  public getFolder(name: string): DirectoryNode {
    const cachedIndex = this.folderMap.get(name);
    const childIndex = cachedIndex != null ? cachedIndex : -1;
    return this.folders[childIndex];
  }
  /**
   * Get Node's folders
   *
   * @returns {DirectoryNode[]}
   * @memberof DirectoryNode
   */
  public getFolders(): DirectoryNode[] {
    return this.folders;
  }
  /**
   * Gets Files in Directory
   *
   * @returns {LearningObject.Material.File[]}
   * @memberof DirectoryNode
   */
  public getFiles(): LearningObject.Material.File[] {
    return this.files;
  }
  /**
   * Add Folder to Node
   *
   * @param {DirectoryNode} newFolder
   * @returns {DirectoryNode}
   * @memberof DirectoryNode
   */
  public addFolder(newFolder: DirectoryNode): DirectoryNode {
    if (this.folderMap.get(newFolder.name) == null) {
      this.folderMap.set(newFolder.name, this.folders.length);
      this.folders.push(newFolder);
    }
    return newFolder;
  }
  /**
   * Add File to Node's files
   *
   * @param {LearningObject.Material.File} newFile
   * @memberof DirectoryNode
   */
  public addFile(newFile: LearningObject.Material.File) {
    if (this.fileMap.get(newFile.name) == null) {
      this.fileMap.set(newFile.name, this.files.length);
      this.files.push(newFile);
    } else {
      const index = this.fileMap.get(newFile.name);
      this.files[index] = newFile;
    }
  }
  /**
   * Remove folder from Node's children by folderName
   *
   * @param {string} folderName
   * @returns {DirectoryNode}
   * @memberof DirectoryNode
   */
  public removeFolder(folderName: string): DirectoryNode {
    const index = this.folderMap.get(folderName);
    if (index >= 0) {
      const deleted = this.folders[index];
      this.folders.splice(index, 1);
      this.folderMap.delete(folderName);
      this.reIndexCacheMap(index, this.folders, this.folderMap);
      return deleted;
    }
    return null;
  }
  /**
   * Remove file from Node's files by filename
   *
   * @param {string} filename
   * @returns {LearningObject.Material.File}
   * @memberof DirectoryNode
   */
  public removeFile(filename: string): LearningObject.Material.File {
    const index = this.fileMap.get(filename);
    if (index >= 0) {
      const deleted = this.files[index];
      this.files.splice(index, 1);
      this.fileMap.delete(filename);
      this.reIndexCacheMap(index, this.files, this.fileMap);
      return deleted;
    }
    return null;
  }

  /**
   * Re-indexes cache map to match modified array
   * Only values after the deleted index get re-indexed
   *
   * @private
   * @param {number} deletedIndex [The index the element was deleted at]
   * @param {Array<DirectoryNode | LearningObject.Material.File>} modifiedArray [The array the element was spliced from]
   * @param {Map<string, number>} cacheMap [The cache map to be re-indexed]
   * @memberof DirectoryNode
   */
  private reIndexCacheMap(
    deletedIndex: number,
    modifiedArray: Array<DirectoryNode | LearningObject.Material.File>,
    cacheMap: Map<string, number>
  ): void {
    if (deletedIndex <= modifiedArray.length - 1) {
      for (let i = deletedIndex; i < modifiedArray.length; i++) {
        const element = modifiedArray[i];
        cacheMap.set((element as any).name, i);
      }
    }
  }
}
