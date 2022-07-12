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
  @Output() removeLo: EventEmitter<any> = new EventEmitter();
  @Output() r: EventEmitter<any> = new EventEmitter();
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
    console.log('adding', this.addNode.emit(this.node));
    this.addNode.emit(this.node);
  }

  remove() {
    console.log('all goode')
    // console.log(this.example.emit(this.node));
    console.log('alslslkdnflask')
  }

}
