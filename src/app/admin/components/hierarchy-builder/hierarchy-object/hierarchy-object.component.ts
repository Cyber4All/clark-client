import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectionStrategy, SimpleChanges } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { HierarchyService } from 'app/admin/core/hierarchy.service';
import { LearningObjectNode } from '../tree-datasource';


@Component({
  selector: 'clark-hierarchy-object',
  templateUrl: './hierarchy-object.component.html',
  styleUrls: ['./hierarchy-object.component.scss']
})
export class HierarchyObjectComponent implements OnInit {

  @Input() node: LearningObjectNode;
  @Input() username: string;
  @Output() addNode: EventEmitter<LearningObjectNode> = new EventEmitter();
  @Output() removeLo: EventEmitter<any> = new EventEmitter();

  nameExists: boolean;

  lengths = [];

  nameFormControl = new FormControl('', [Validators.required]);
  constructor(
    private hierarchyService: HierarchyService
  ) { }

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

  async ngDoCheck() {
    this.nameExists = await this.checkLearningObjectName();
  }

  remove() {
    this.removeLo.emit(this.node);
  }

  async checkLearningObjectName(event?: any){
    return await this.hierarchyService.checkName(this.username, this.node.name);
  }
}
