
import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { LearningObject } from '@entity';
import { HierarchyService } from 'app/core/learning-object-module/hierarchy/hierarchy.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { LearningObjectNode, TreeDataSource } from './tree-datasource';

@Component({
  selector: 'clark-hierarchy-builder',
  templateUrl: 'hierarchy-builder.component.html',
  styleUrls: ['hierarchy-builder.component.scss'],
})
export class HierarchyBuilderComponent implements OnInit {

  // This is just dummy data that is replaced in the OnInit function with the parent data
  TREE_DATA: LearningObjectNode[] = [
    {
      'name': 'paige the rage',
      'length': 'nanomodule',
      'children': []
    }
  ];

  @Input() parent: LearningObject;
  @Output() close: EventEmitter<void> = new EventEmitter();
  treeControl = new NestedTreeControl<LearningObjectNode>(node => node.children);
  dataSource = new TreeDataSource(this.treeControl, this.TREE_DATA);
  contributors: string[];
  acknowledge: boolean;

  constructor(
    private hierarchyService: HierarchyService,
    private toaster: ToastrOvenService,
  ) { }

  ngOnInit() {
    this.TREE_DATA[0] = { _id: this.parent.id, name: this.parent.name, length: this.parent.length, showForm: false, children: [] };
    this.contributors = this.parent.contributors.map(contrib => {
      return contrib.username;
    });
  }

  // Determines if the learning object node has a child
  hasChild = (_: number, node: LearningObjectNode) =>
    !!node.children && node.children.length > 0;

  /**
   * Adds a blank learning object to the parent node
   *
   * @param parentNode the node having a baby in this function
   */
  addLearningObject(parentNode: LearningObjectNode) {
    let length = 'unit';
    if (parentNode.length === 'unit') {
      length = 'module';
    }
    if (parentNode.length === 'module') {
      length = 'micromodule';
    }
    if (parentNode.length === 'micromodule') {
      length = 'nanomodule';
    }
    const obj = { name: '', length: length, showForm: true };
    if (parentNode.length !== 'nanomodule') {
      obj['children'] = [];
    }
    obj['contributors'] = this.contributors;
    obj['collection'] = this.parent.collection;
    this.dataSource.add(obj, parentNode);
  }

  remove(node: LearningObjectNode) {
    this.dataSource.remove(node);
  }

  checkBox() {
    this.acknowledge = !this.acknowledge;
  }

  /**
   * Creates the learning object hierarchy recursively
   * The function takes in a node which is the parent of the hierarchy
   * If the node doesn't have children just create the learning object in learning object service and return the _id of the new object
   * If the node has children iterate through the children and create each child. The _id of the child is then returned
   * When all the children and childrens children are created add the children's ids to the parent
   * If the node is the parent object we don't need to create the object because it already exists so just add the children
   * Once the parent node has been reached pop a toaster and be gone with the recursion
   *
   * @param node the node that will be the top level parent of the hierarchy
   * @returns
   */

  async createLearningObjects(node: any) {

    if (node.children.length === 0) {
      return this.hierarchyService.addHierarchyObject(this.parent.author.username, node);
    }
    const childrenIds = [];
    for await (const child of node.children) {
      childrenIds.push(await this.createLearningObjects(child));
    }
    let parentId = this.parent.id;
    if (node.name !== this.parent.name) {
      parentId = await this.hierarchyService.addHierarchyObject(this.parent.author.username, node);
    }
    const newNode = await this.setParents(parentId, childrenIds);
    if (node.name === this.parent.name) {
      this.toaster.success(
        'Success',
        'Hierarchy Created!'
      );
      this.close.emit();
    }
    return newNode;
  }

  /**
   * Helper function for the createLearningObjects function
   *
   * @param node the node getting children
   * @param childs the children being added to the parent node
   * @returns
   */
  async setParents(node, childs) {
    await this.hierarchyService.addChildren(this.parent.author.username, node, childs);
    return node;
  }
}
