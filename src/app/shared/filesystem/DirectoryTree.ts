import { getPaths } from './file-functions';
import { LearningObject } from '@entity';

/**
 * Class Representing Simple Filesystem
 *
 * @export
 * @class DirectoryTree
 */
export class DirectoryTree {
  private _root: DirectoryNode;
  private lastNode: DirectoryNode;
  private fileMap: Map<string, { path: string; file: string }> = new Map<
    string,
    { path: string; file: string }
  >();
  private pathMap: Map<string, number> = new Map<string, number>();
  constructor() {
    this._root = new DirectoryNode('', '', null);
  }
  /**
   * Adds new Files to Directory Tree
   *
   * @param {LearningObject.Material.File[]} files
   * @memberof DirectoryTree
   */
  public addFiles(files: LearningObject.Material.File[]) {
    // Returns new files and files that have had their metadata changed
    const getUpdatedFiles = (fileList: LearningObject.Material.File[]) =>
      fileList.filter(file => {
        const mappedFile = this.fileMap.get(file.id);
        if (mappedFile && mappedFile.file === JSON.stringify(file)) {
          return false;
        }
        return true;
      });
    const newFiles = getUpdatedFiles(files);
    for (const file of newFiles) {
      this.fileMap.set(file.id, {
        path: file.fullPath ? file.fullPath : file.name,
        file: JSON.stringify(file)
      });
      if (!file.fullPath) {
        this._root.addFile(file);
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
    }
    this.cleanFilesystem(files);
  }

  /**
   * Removes cached files that are no longer in the array of files
   *
   * @private
   * @param {LearningObject.Material.File[]} files
   * @memberof DirectoryTree
   */
  private cleanFilesystem(files: LearningObject.Material.File[]) {
    /**
     * Checks if file is in array by matching against id and path
     *
     * @returns {boolean}
     */
    const findFile = (params: {
      cachedFileData: { id: string; path: string };
      file: LearningObject.Material.File;
    }): boolean => {
      const { cachedFileData, file } = params;
      const filePath = file.fullPath || file.name;
      return cachedFileData.id === file.id || cachedFileData.path === filePath;
    };

    const folderPaths = [];

    // Remove file for file system and cache
    this.fileMap.forEach((mappedFile, mappedId) => {
      const fileExists = files.find(file =>
        findFile({
          file,
          cachedFileData: { id: mappedId, path: mappedFile.path }
        })
      );

      if (!fileExists) {
        this.removeFile(mappedFile.path);
        this.fileMap.delete(mappedId);
        const folderPath = getPaths(mappedFile.path).join('/');
        if (!folderPaths.includes(folderPath)) {
          folderPaths.push(folderPath);
        }
      }
    });

    // Remove empty folders leftover from file removal
    for (const path of folderPaths) {
      const paths = getPaths(path, false);
      const node = this.traversePath(paths);
      if (node) {
        this.removeEmptyFolders(node);
      }
    }
  }
  private buildSubTree(paths: string[]) {
    const last_touched_node_paths = getPaths(this.lastNode.getPath(), false);
    const _paths = [...last_touched_node_paths];
    const continueFromIndex = last_touched_node_paths.length;
    let lastCreatedNode: DirectoryNode;
    for (let i = continueFromIndex; i < paths.length; i++) {
      const p = paths[i];
      _paths.push(p);
      const _node = this.traversePath(_paths);
      if (!_node) {
        const name = p;
        lastCreatedNode = this.add(name, `${_paths.join('/')}`, this.lastNode);
      }
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
        return this._root;
      }

      const nodeIndex = this.pathMap.get(currentPath);
      const nodeChildren = this._root.getChildren();

      const currentNode =
        nodeIndex !== undefined
          ? nodeChildren[nodeIndex]
          : this.findNodeAtLevel(currentPath, nodeChildren);

      if (currentNode) {
        return this.traversePath(paths, currentNode);
      }

      this.lastNode = this._root;
      return null;
    }

    if (!currentPath) {
      return parent;
    }

    const parentPath = parent.getPath();
    const childPath = `${parentPath}/${currentPath}`;
    const children = parent.getChildren();
    const cachedIndex = this.pathMap.get(childPath);
    const index = cachedIndex !== undefined ? cachedIndex : -1;
    let node = children[index] || this.findNodeAtLevel(currentPath, children);
    if (node && node.getName() !== currentPath) {
      node = this.findNodeAtLevel(currentPath, children);
    }
    if (node) {
      return this.traversePath(paths, node);
    }

    this.lastNode = parent;
    return null;
  }
  /**
   * Finds Node within array of children and caches location
   *
   * @param {string} path
   * @param {DirectoryNode[]} elements
   * @returns {DirectoryNode}
   * @memberof DirectoryTree
   */
  public findNodeAtLevel(
    path: string,
    elements: DirectoryNode[]
  ): DirectoryNode {
    let node;
    for (let i = 0; i < elements.length; i++) {
      const child = elements[i];
      if (child.getName() === path) {
        this.pathMap.set(child.getPath(), i);
        node = child;
        break;
      }
    }
    return node;
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
  private add(
    name: string,
    path: string,
    parent: DirectoryNode
  ): DirectoryNode {
    const newNode = new DirectoryNode(name, path, parent);
    parent.addChild(newNode);
    // Cache path's index
    this.pathMap.set(path, parent.getChildren().length - 1);
    return parent.getChildren()[parent.getChildren().length - 1];
  }

  /**
   * Removes folder at path from Tree
   *
   * @param {string[]} paths Array of paths to folder
   * @memberof DirectoryTree
   */
  public removeFolder(path: string) {
    const paths = getPaths(path, false);
    const node = this.traversePath(paths);
    if (node) {
      const parent = node.getParent();
      const index = this.pathMap.get(node.getPath());
      const removingFrom = parent ? parent : this._root;
      removingFrom.getChildren().splice(index, 1);
    } else {
      throw new Error(`Node at path: ${path} does not exist`);
    }
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
      return node.removeFile(fileName);
    } else {
      throw new Error(`Node at path: ${folderPath.join('/')} does not exist`);
    }
  }

  /**
   * Recursively removes empty folders starting for leaf node
   *
   * @private
   * @param {DirectoryNode} node
   * @memberof DirectoryTree
   */
  private removeEmptyFolders(node: DirectoryNode): void {
    if (
      !this.isRoot(node) &&
      !node.getChildren().length &&
      !node.getFiles().length
    ) {
      const parent = node.getParent();
      this.removeFolder(node.getPath());
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
    return node.getPath() === this._root.getPath();
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
  private children: DirectoryNode[];
  public description: string;

  constructor(name: string, path: string, parent: DirectoryNode) {
    this.name = name;
    this.path = path;
    this.files = [];
    this.parent = parent;
    this.children = [];
    this.description = '';
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
   * Get Node's children
   *
   * @returns {DirectoryNode[]}
   * @memberof DirectoryNode
   */
  public getChildren(): DirectoryNode[] {
    return this.children;
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
   * Add Child to Node
   *
   * @param {DirectoryNode} child
   * @returns {DirectoryNode}
   * @memberof DirectoryNode
   */
  public addChild(newChild: DirectoryNode): DirectoryNode {
    let canAdd = true;
    for (const child of this.children) {
      if (newChild.name === child.name) {
        canAdd = false;
        break;
      }
    }
    if (canAdd) {
      this.children.push(newChild);
    }
    return newChild;
  }
  /**
   * Add File to Node's files
   *
   * @param {LearningObject.Material.File} newFile
   * @memberof DirectoryNode
   */
  public addFile(newFile: LearningObject.Material.File) {
    let canAdd = true;
    for (const file of this.files) {
      if (file.name === newFile.name) {
        canAdd = false;
        break;
      }
    }
    if (canAdd) {
      this.files.push(newFile);
    }
  }
  /**
   * Remove file from Node's files by filename
   *
   * @param {string} filename
   * @returns {LearningObject.Material.File}
   * @memberof DirectoryNode
   */
  public removeFile(filename: string): LearningObject.Material.File {
    const index = this.findFile(filename);
    const deleted = this.files[index];
    this.files.splice(index, 1);
    return deleted;
  }
  /**
   * Finds file by filename
   *
   * @private
   * @param {string} filename
   * @returns {number}
   * @memberof DirectoryNode
   */
  private findFile(filename: string): number {
    let index = 0;
    for (let i = 0; i < this.files.length; i++) {
      if (this.files[i].name === filename) {
        index = i;
        break;
      }
    }
    return index;
  }
}
