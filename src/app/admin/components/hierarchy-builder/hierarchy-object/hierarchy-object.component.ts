import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { LearningObjectNode } from '../tree-datasource';

@Component({
  selector: 'clark-hierarchy-object',
  templateUrl: './hierarchy-object.component.html',
  styleUrls: ['./hierarchy-object.component.scss']
})
export class HierarchyObjectComponent implements OnInit {

  @Input() node: LearningObjectNode;
  @Output() addNode: EventEmitter<void> = new EventEmitter()
  lengths = [
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
  ];
  constructor() { }

  ngOnInit(): void {
    console.log(this.node.name, this.node.length)
    let length = "unit";
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
        }
      ]
    }
    if(this.node.length === "micromodule") {
      this.lengths = [this.lengths[0]];
    }
  }

}
