import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { HierarchyService } from 'app/core/learning-object-module/hierarchy/hierarchy.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { Observable } from 'rxjs';
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

  nameFormControl = new FormControl(
    '',
    { validators: [Validators.required, Validators.minLength(2), this.forbiddenNameValidator()], updateOn: 'blur' }
  );
  constructor(
    private hierarchyService: HierarchyService,
    private toaster: ToastrOvenService,
  ) { }

  ngOnInit(): void {
    this.lengths = [];
    if (this.node.length === 'unit') {

      this.lengths = [
        {
          value: 'nanomodule',
          viewValue: 'Nanomodule'
        },
        {
          value: 'micromodule',
          viewValue: 'Micromodule'
        },
        {
          value: 'module',
          viewValue: 'Module'
        },
        {
          value: 'unit',
          viewValue: 'Unit'
        }
      ];
    }
    if (this.node.length === 'module') {
      this.lengths = [
        {
          value: 'nanomodule',
          viewValue: 'Nanomodule'
        },
        {
          value: 'micromodule',
          viewValue: 'Micromodule'
        },
        {
          value: 'module',
          viewValue: 'Module'
        }
      ];
    }
    if (this.node.length === 'micromodule') {
      this.lengths = [
        {
          value: 'nanomodule',
          viewValue: 'Nanomodule'
        },
        {
          value: 'micromodule',
          viewValue: 'Micromodule'
        }
      ];
    }
    if (this.node.length === 'nanomodule') {
      this.lengths = [
        {
          value: 'nanomodule',
          viewValue: 'Nanomodule'
        },
      ];
    }
  }


  remove() {
    this.removeLo.emit(this.node);
  }


  /**
   * Determines if the name of the learning is forbidden because it is already taken for the author
   */
  forbiddenNameValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
      if (this.node) {
        return this.hierarchyService.checkName(this.username, this.node.name).then(val => {
          if (val === true) {
            this.toaster.error(
              'Error',
              'Name already exists!'
            );
            return { forbiddenName: { value: val } };
          } else {
            return;
          }
        });
      }
    };
  }
}
