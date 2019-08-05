import { getPaths } from './file-functions';
import { LearningObject } from '@entity';

/**
 * Class Representing Simple Filesystem
 *
 * @export
 * @class DirectoryTree
 */
export class DirectoryTree {
  private root: DirectoryNode;
  private lastTouchedNode: DirectoryNode;

  constructor() {
    this.root = new DirectoryNode('', '', null);
  }

  /**
   * Returns folder DirectoryNode object if the folder exists within parent DirectoryNode
   *
   * @param {DirectoryNode} parent [The folder that contains the sub folder to be returned]
   * @param {string} folderName [The name of the sub folder that should be returned]
   * @returns {DirectoryNode}
   * @memberof DirectoryTree
   */
  public getFolder(parent: DirectoryNode, folderName: string): DirectoryNode {
    return parent.getFolder(folderName);
  }
  /**
   * Adds new Files to Directory Tree
   *
   * @param {LearningObject.Material.File[]} files
   * @memberof DirectoryTree
   */
  public addFiles(files: LearningObject.Material.File[]) {
    files.forEach(file => {
      if (!file.fullPath) {
        this.root.addFile(file);
      } else {
        const paths = getPaths(file.fullPath);
        let node = this.traversePath(paths);
        if (node) {
          node.addFile(file);
        } else {
          node = this.buildSubTree(paths);
          node.addFile(file);
        }
      }
    });
  }

  /**
   * Appends a new node for all missing directory paths
   *
   * @private
   * @param {string[]} paths [All path segments of the file]
   * @returns
   * @memberof DirectoryTree
   */
  private buildSubTree(paths: string[]) {
    const last_touched_node_paths = getPaths(
      this.lastTouchedNode.getPath(),
      false
    );
    const currentPaths = [...last_touched_node_paths];
    const continueFromIndex = last_touched_node_paths.length;
    let lastCreatedNode: DirectoryNode;
    for (let i = continueFromIndex; i < paths.length; i++) {
      const folderName = paths[i];
      currentPaths.push(folderName);
      lastCreatedNode = this.addFolder(
        folderName,
        `${currentPaths.join('/')}`,
        lastCreatedNode || this.lastTouchedNode
      );
    }
    return lastCreatedNode;
  }

  /**
   * Traverses Filesystem Tree on path
   *
   * @param {string[]} paths Array of paths to Node
   * @param {DirectoryNode} [parent]
   * @returns {DirectoryNode}
   * @memberof DirectoryTree
   */
  public traversePath(paths: string[], parent?: DirectoryNode): DirectoryNode {
    paths = [...paths];
    const currentPath = paths.shift();
    if (!parent) {
      if (!currentPath) {
        return this.root;
      }

      const currentNode = this.root.getFolder(currentPath);

      if (currentNode) {
        return this.traversePath(paths, currentNode);
      }

      this.lastTouchedNode = this.root;
      return null;
    }

    if (!currentPath) {
      return parent;
    }

    const node = parent.getFolder(currentPath);
    if (node) {
      return this.traversePath(paths, node);
    }

    this.lastTouchedNode = parent;
    return null;
  }

  /**
   * Adds new Node to Parent Node
   *
   * @private
   * @param {string} name
   * @param {string} path
   * @param {DirectoryNode} parent
   * @returns {DirectoryNode}
   * @memberof DirectoryTree
   */
  private addFolder(
    name: string,
    path: string,
    parent: DirectoryNode
  ): DirectoryNode {
    const newNode = new DirectoryNode(name, path, parent);
    parent.addFolder(newNode);
    return newNode;
  }

  /**
   * Is the DirectoryTree empty (no files or folders)
   *
   * @readonly
   * @type {boolean}
   * @memberof DirectoryTree
   */
  get isEmpty(): boolean {
    return this.root.isEmpty();
  }

  /**
   * Removes folder at path from Tree
   *
   * @param {string[]} paths Array of paths to folder
   * @memberof DirectoryTree
   */
  public removeFolder(path: string): DirectoryNode {
    const paths = getPaths(path, false);
    const node = this.traversePath(paths);
    if (node) {
      const parent = node.getParent();
      const deleted = parent.removeFolder(node.getName());
      this.removeEmptyFolders(parent);
      return deleted;
    }
    return null;
  }
  /**
   * Removes file at path from Tree
   *
   * @param {string[]} paths Array of paths to file
   * @memberof DirectoryTree
   */
  public removeFile(path: string): LearningObject.Material.File {
    const folderPath = getPaths(path);
    const fileName = path.split('/').pop();
    const node = this.traversePath(folderPath);
    if (node) {
      const deleted = node.removeFile(fileName);
      this.removeEmptyFolders(node);
      return deleted;
    }
    return null;
  }

  /**
   * Recursively removes empty folders starting from leaf node
   *
   * @private
   * @param {DirectoryNode} node
   * @memberof DirectoryTree
   */
  private removeEmptyFolders(node: DirectoryNode): void {
    if (!this.isRoot(node) && node.isEmpty()) {
      const parent = node.getParent();
      parent.removeFolder(node.getName());
      this.removeEmptyFolders(parent);
    }
  }

  /**
   * Checks whether or not a node is the root by comparing the node's path to the root path
   *
   * @private
   * @param {DirectoryNode} node [Node to check in directory tree]
   * @returns {boolean}
   * @memberof DirectoryTree
   */
  private isRoot(node: DirectoryNode): boolean {
    return node.getPath() === this.root.getPath();
  }
}

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
