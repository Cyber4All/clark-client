import {ArrayDataSource} from '@angular/cdk/collections';
import {FlatTreeControl, NestedTreeControl} from '@angular/cdk/tree';
import {Component, Input, OnInit} from '@angular/core';
import { LearningObject } from '@entity';
import { LearningObjectNode, TreeDataSource } from './tree-datasource';

@Component({
  selector: 'clark-hierarchy-builder',
  templateUrl: 'hierarchy-builder.component.html',
  styleUrls: ['hierarchy-builder.component.scss'],
})
export class HierarchyBuilderComponent implements OnInit {

  TREE_DATA: LearningObjectNode[] = [
    {
      "name": "paige",
      "length": "nanomodule",
      "children": []
    }
  ];

  @Input() parent: LearningObject;
  treeControl = new NestedTreeControl<LearningObjectNode>(node => node.children);
  dataSource = new TreeDataSource(this.treeControl, this.TREE_DATA);

  constructor() {}

  ngOnInit() {
    this.TREE_DATA[0] = { name: this.parent.name, length: this.parent.length, showForm: false, children: []};
  }

  hasChild = (_: number, node: LearningObjectNode) =>
    !!node.children && node.children.length > 0;

  addLearningObject(parentNode: LearningObjectNode) {
    let length = 'unit'
    if(parentNode.length === 'unit') {
      length = 'module';
    }
    if(parentNode.length === 'module') {
      length = 'micromodule';
    }
    if(parentNode.length === 'micromodule') {
      length = 'nanomodule';
    }
    const obj = { name: 'adding', length: length, showForm: true };
    if(parentNode.length !== 'nanomodule') {
      obj["children"] = [];
    }
    this.dataSource.add(obj, parentNode);
  }

  remove(node: LearningObjectNode) {
    this.dataSource.remove(node);
  }
}
