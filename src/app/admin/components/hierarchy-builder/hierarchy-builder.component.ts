import {ArrayDataSource} from '@angular/cdk/collections';
import {FlatTreeControl, NestedTreeControl} from '@angular/cdk/tree';
import {Component, Input, OnInit} from '@angular/core';
import { LearningObject } from '@entity';
import { CollectionService } from 'app/admin/core/collection.service';
import { createObjectBindingPattern } from 'typescript';
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
    console.log('wowow')
    this.dataSource.remove(node);
  }

  createObj(node, callback) {
    callback({
      next_cursor: (node.cursor + 2)
    }, 0);
  }

  createHierarchy() {
    let cursor = -1;
    let promise = new Promise((resolve, reject) => {
      createObj({cursor}, function callback(data, error) {
        if(error) {
          reject(false);
        }
        cursor = data.next_cursor
        console.log(cursor)
        if(cursor <= 6) {
          createObj({cursor}, callback)
          return;
        }
        resolve(true);
      })
    });
    promise.then(function() {
      console.log('done');
    });
    //REcursively go up a node
    // 1. Create the lowest level child objects
    // 2. Add all of those children to the next level parent
    // 3. Add all of those to next level parent until it reaches the learning object that was the root
  }
}

function createObj(node, callback) {
  callback({
    next_cursor: (node.cursor + 2)
  }, 0);
}