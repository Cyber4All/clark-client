
import { NestedTreeControl} from '@angular/cdk/tree';
import {Component, Input, OnInit} from '@angular/core';
import { LearningObject } from '@entity';
import { CollectionService } from 'app/admin/core/collection.service';
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

  constructor(
    private collectionService: CollectionService
  ) {}

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
    console.log('NODE', node);
    this.dataSource.remove(node);
  }

  update(node: LearningObjectNode) {
    console.log(this.TREE_DATA);
    console.log('WOWOW')
  }

  async createLearningObjects() {
    const object = this.TREE_DATA[0].children[0];
    object.contributors = this.parent.contributors.map(contrib => {
      return contrib._username;
    });
    await this.collectionService.addHierarchyObject(this.parent.author.username, this.TREE_DATA[0].children[0]);
  }
}