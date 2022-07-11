import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { LearningObjectNode } from '../tree-datasource';

@Component({
  selector: 'clark-hierarchy-object',
  templateUrl: './hierarchy-object.component.html',
  styleUrls: ['./hierarchy-object.component.scss']
})
export class HierarchyObjectComponent implements OnInit {

  @Input() node: LearningObjectNode;
  @Output() addNode: EventEmitter<LearningObjectNode> = new EventEmitter();
  @Output() removeNode: EventEmitter<LearningObjectNode> = new EventEmitter();
  lengths = [];
  constructor() { }

  ngOnInit(): void {
    this.lengths = [];
    if(this.node.length === "unit") {
      
      this.lengths = [
        {
          value: "nanomodule",
          viewValue: "Nanomodule"
        },
        {
          value: "micromodule",
          viewValue: "Micromodule"
        },
        {
          value: "module",
          viewValue: "Module"
        },
        {
          value: "unit",
          viewValue: "Unit"
        }
      ]
    }
    if(this.node.length === "module") {
      this.lengths = [
        {
          value: "nanomodule",
          viewValue: "Nanomodule"
        },
        {
          value: "micromodule",
          viewValue: "Micromodule"
        },
        {
          value: "module",
          viewValue: "Module"
        }
      ]
    }
    if(this.node.length === "micromodule") {
      this.lengths = [
        {
          value: "nanomodule",
          viewValue: "Nanomodule"
        },
        {
          value: "micromodule",
          viewValue: "Micromodule"
        }
      ];
    }
    if(this.node.length === "nanomodule") {
      this.lengths = [
        {
          value: "nanomodule",
          viewValue: "Nanomodule"
        },
      ]
    }
  }


  sendChange() {
    this.addNode.emit(this.node);
  }

}
