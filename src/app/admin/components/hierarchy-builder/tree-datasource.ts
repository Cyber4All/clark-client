import { NestedTreeControl } from "@angular/cdk/tree";
import { MatTreeNestedDataSource } from "@angular/material/tree";

/**
 * Food data with nested structure.
 * Each node has a name and an optional list of children.
 */
export interface LearningObjectNode {
  _id?: string;
  name: string;
  length: string;
  collection?: string;
  contributors?: string[];
  showForm?: boolean;
  children?: LearningObjectNode[];
}

export class TreeDataSource extends MatTreeNestedDataSource<LearningObjectNode> {
  constructor(
    private treeControl: NestedTreeControl<LearningObjectNode>,
    initialData: LearningObjectNode[]
  ) {
    super();
    this.data = initialData;
  }

  /**
   * Adds a node to the tree
   * @param node the node that needs to be added
   * @param parent the node that the new node will be the child of
   */
  public add(node: LearningObjectNode, parent: LearningObjectNode) {
    // add dummy root so we only have to deal with LearningObjectNodes
    const newTreeData = { name: "Yeetus Maximus", length: 'nanomodule', children: this.data };
    this._add(node, parent, newTreeData);
    this.data = newTreeData.children;
  }

  /**
   * Removes the node from the tree
   * @param node the node that is to be removed
   */
  public remove(node: LearningObjectNode) {
    const newTreeData = { name: "Yeetus Maximus", length: 'nanomodule', children: this.data };
    this._remove(node, newTreeData);
    this.data = newTreeData.children;
  }

  /**
   * Adds a new node to a sub-tree
   * @param newNode the new node to be added
   * @param parent the direct parent of the newNode
   * @param tree the tree that the parent is apart of 
   * @returns updated tree with new node
   */
  protected _add(newNode: LearningObjectNode, parent: LearningObjectNode, tree: LearningObjectNode) {
    if (tree === parent) {
      tree.children = [...tree.children!, newNode];
      this.treeControl.expand(tree);
      return true;
    }
    if (!tree.children) {
      return false;
    }
    return this.update(tree, this._add.bind(this, newNode, parent));
  }

  /**
   * Removes a child node from a tree
   * @param node the node to be removed
   * @param tree the tree that the node is in
   * @returns 
   */
  protected _remove(node: LearningObjectNode, tree: LearningObjectNode): boolean {
    if (!tree.children) {
      return false;
    }
    const i = tree.children.indexOf(node);
    if (i > -1) {
      tree.children = [
        ...tree.children.slice(0, i),
        ...tree.children.slice(i + 1)
      ];
      this.treeControl.collapse(node);
      return true;
    }
    return this.update(tree, this._remove.bind(this, node));
  }

  /**
   * Determines how a sub tree needs to be updated depending on if a node was added or taken away
   */
  protected update(tree: LearningObjectNode, predicate: (n: LearningObjectNode) => boolean) {
    let updatedTree: LearningObjectNode, updatedIndex: number;

    tree.children!.find((node, i) => {
      if (predicate(node)) {
        updatedTree = { ...node };
        updatedIndex = i;
        this.moveExpansionState(node, updatedTree);
        return true;
      }
      return false;
    });

    if (updatedTree!) {
      tree.children![updatedIndex!] = updatedTree!;
      return true;
    }
    return false;
  }

  /**
   * Determines if the sub tree is expanded or closed
   * @param from the node that is either open or closed
   * @param to the node that needs to be either open or closed
   */

  moveExpansionState(from: LearningObjectNode, to: LearningObjectNode) {
    if (this.treeControl.isExpanded(from)) {
      this.treeControl.collapse(from);
      this.treeControl.expand(to);
    }
  }
}