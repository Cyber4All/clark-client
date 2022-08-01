
import { NestedTreeControl} from '@angular/cdk/tree';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { LearningObject } from '@entity';
import { HierarchyService } from 'app/admin/core/hierarchy.service';
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
  @Output() close: EventEmitter<void> = new EventEmitter();
  treeControl = new NestedTreeControl<LearningObjectNode>(node => node.children);
  dataSource = new TreeDataSource(this.treeControl, this.TREE_DATA);
  contributors: string [];
  acknowledge: boolean;

  constructor(
    private hierarchyService: HierarchyService
  ) {}

  ngOnInit() {
    this.TREE_DATA[0] = { _id: this.parent.id, name: this.parent.name, length: this.parent.length, showForm: false, children: []};
    this.contributors = this.parent.contributors.map(contrib => {
      return contrib.username
    });
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
    const obj = { name: '', length: length, showForm: true };
    if(parentNode.length !== 'nanomodule') {
      obj["children"] = [];
    }
    obj["contributors"] = this.contributors;
    obj["collection"] = this.parent.collection;
    this.dataSource.add(obj, parentNode);
  }

  remove(node: LearningObjectNode) {
    this.dataSource.remove(node);
    console.log('ahahahah', !this.acknowledge);
  }

  checkBox() {
    this.acknowledge = !this.acknowledge;
  }

  validateSubmitable(node) {
    if(node.name.length <= 2) {
      // Pop up an error
    }
    if(node.children.length === 0) {
      return;
    } else if(node.children.length > 0) {
      node.children.forEach(child => {
        this.validateSubmitable(child);
      })
    }
  }
  

  async createLearningObjects(node: any) {

    if(node.children.length === 0) {
      return this.hierarchyService.addHierarchyObject(this.parent.author.username, node);
    }
    const childrenIds = [];
    for await (const child of node.children) {
      childrenIds.push(await this.createLearningObjects(child));
    }
    let parentId = this.parent.id;
    if(node.name !== this.parent.name) {
      parentId = await this.hierarchyService.addHierarchyObject(this.parent.author.username, node);
    }
    console.log('Should close', node.name === this.parent.name)
    if(node.name === this.parent.name) {
      this.close.emit();
    }
    return await this.setParents(parentId, childrenIds);
  }

  async setParents(node, childs) {
    await this.hierarchyService.addChildren(this.parent.author.username, node, childs);
    return node;
  }
}