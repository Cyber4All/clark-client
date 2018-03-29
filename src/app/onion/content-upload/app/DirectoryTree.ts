import { getPaths } from './file-functions';

/**
 * Class Representing Simple Filesystem
 *
 * @export
 * @class DirectoryTree
 */
export class DirectoryTree {
  private _root: DirectoryNode;
  private lastNode: DirectoryNode;
  private pathMap: Map<string, number> = new Map<string, number>();
  constructor() {
    this._root = new DirectoryNode('', '', null);
  }
  /**
   * Adds new Files to Directory Tree
   *
   * @param {LearningObjectFile[]} files
   * @memberof DirectoryTree
   */
  public addFiles(files: LearningObjectFile[]) {
    for (let file of files) {
      if (!file.fullPath) {
        this._root.addFile(file);
      } else {
        let paths = getPaths(file.fullPath);
        let node = this.traversePath(paths);
        if (node) {
          node.addFile(file);
        } else {
          let paths = getPaths(file.fullPath);
          let path = paths.join('/');
          let name = paths.pop();
          let newNode = this.add(name, path, this.lastNode);
          newNode.addFile(file);
          this.lastNode = undefined;
        }
      }
    }
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
    let currentPath = paths.shift();
    if (!parent) {
      if (!currentPath) return this._root;

      let index = this.pathMap.get(currentPath);
      let children = this._root.getChildren();

      let node = index
        ? children[index]
        : this.findNodeAtLevel(currentPath, children);

      if (node) return this.traversePath(paths, node);

      this.lastNode = this._root;
      return null;
    }

    if (!currentPath) return parent;

    let parentPath = parent.getPath();
    let childPath = `${parentPath}/${currentPath}`;
    let index = this.pathMap.get(childPath);
    let children = parent.getChildren();
    let node = index
      ? children[index]
      : this.findNodeAtLevel(currentPath, children);

    if (node) return this.traversePath(paths, node);

    this.lastNode = parent;
    return null;
  }
  /**
   * Finds Node within array of children and cahes location
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
      let child = elements[i];
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
    let newNode = new DirectoryNode(name, path, parent);
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
  public removeFolder(paths: string[]) {
    let node = this.traversePath(paths);
    if (node) {
      let parent = node.getParent();
      let index = this.pathMap.get(node.getPath());
      let removingFrom = parent ? parent : this._root;
      removingFrom.getChildren().splice(index, 1);
    } else {
      throw new Error(`Node at path: ${paths.join('/')} does not exist`);
    }
  }
  /**
   * Removes folder at path from Tree
   *
   * @param {string[]} paths Array of paths to file
   * @memberof DirectoryTree
   */
  public removeFile(paths: string[]): LearningObjectFile {
    let folderPath = getPaths(paths.join('/'));
    let fileName = paths.pop();
    let node = this.traversePath(folderPath);
    if (node) {
      let parent = node.getParent();
      let index = this.pathMap.get(node.getPath());
      let removingFrom = parent ? parent : this._root;
      return removingFrom.removeFile(fileName);
    } else {
      throw new Error(`Node at path: ${folderPath.join('/')} does not exist`);
    }
  }
  //TODO: Implement
  public contains() {
    throw new Error('Contains not yet implemented');
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
  private files: LearningObjectFile[];
  private parent: DirectoryNode;
  private children: DirectoryNode[];

  constructor(name: string, path: string, parent: DirectoryNode) {
    this.name = name;
    this.path = path;
    this.files = [];
    this.parent = parent;
    this.children = [];
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
   * Add Child to Node
   *
   * @param {DirectoryNode} child
   * @returns {DirectoryNode}
   * @memberof DirectoryNode
   */
  public addChild(child: DirectoryNode): DirectoryNode {
    this.children.push(child);
    return this.children[this.children.length - 1];
  }
  /**
   * Add File to Node's files
   *
   * @param {LearningObjectFile} newFile
   * @memberof DirectoryNode
   */
  public addFile(newFile: LearningObjectFile) {
    let canAdd = true;
    for (let file of this.files) {
      if (file.name === newFile.name) {
        canAdd = false;
        break;
      }
    }
    if (canAdd) this.files.push(newFile);
  }
  /**
   * Remove file from Node's files by filename
   *
   * @param {string} filename
   * @returns {LearningObjectFile}
   * @memberof DirectoryNode
   */
  public removeFile(filename: string): LearningObjectFile {
    let index = this.findFile(filename);
    let deleted = this.files[index];
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
      if (this.files[i].name == filename) {
        index = i;
        break;
      }
    }
    return index;
  }
}

export type LearningObjectFile = {
  id: string;
  name: string;
  fileType: string;
  extension: string;
  url: string;
  date: string;
  fullPath?: string;
};
