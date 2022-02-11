import { getPaths } from './file-functions';
import { LearningObject } from '@entity';
import { DirectoryNode } from './DirectoryNode';

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
    files.forEach((file) => {
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
    // eslint-disable-next-line @typescript-eslint/naming-convention
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
