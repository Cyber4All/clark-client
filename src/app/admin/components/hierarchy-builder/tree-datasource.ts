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

  /** Add node as child of parent */
  public add(node: LearningObjectNode, parent: LearningObjectNode) {
    // add dummy root so we only have to deal with `FoodNode`s
    const newTreeData = { name: "Dummy Root", length: 'nanomodule', children: this.data };
    this._add(node, parent, newTreeData);
    this.data = newTreeData.children;
  }

  /** Remove node from tree */
  public remove(node: LearningObjectNode) {
    const newTreeData = { name: "Dummy Root", length: 'nanomodule', children: this.data };
    this._remove(node, newTreeData);
    this.data = newTreeData.children;
  }

  /*
   * For immutable update patterns, have a look at:
   * https://redux.js.org/recipes/structuring-reducers/immutable-update-patterns/
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

  _remove(node: LearningObjectNode, tree: LearningObjectNode): boolean {
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

  moveExpansionState(from: LearningObjectNode, to: LearningObjectNode) {
    if (this.treeControl.isExpanded(from)) {
      this.treeControl.collapse(from);
      this.treeControl.expand(to);
    }
  }
}