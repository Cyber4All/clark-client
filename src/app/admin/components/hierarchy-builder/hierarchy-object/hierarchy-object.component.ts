import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, UntypedFormControl, ValidationErrors, Validators } from '@angular/forms';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { Observable } from 'rxjs';
import { LearningObjectNode } from '../tree-datasource';
import { SearchService } from 'app/core/learning-object-module/search/search.service';


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

  nameFormControl = new UntypedFormControl(
    '',
    { validators: [Validators.required, Validators.minLength(2), this.forbiddenNameValidator()], updateOn: 'blur' }
  );
  constructor(
    private searchService: SearchService,
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
        return this.searchService.getUsersLearningObjects(this.username, { text: control.value })
          .then((response: { learningObjects: any[]; total: number }) => {
            const possibleMatches = response.learningObjects.map(object => {
              return object.name;
            });

            // If the name is already taken, return an error
            if(possibleMatches.includes(control.value)) {
              this.toaster.error(
                'Error',
                'Name already exists!'
              );
              return { forbiddenName: { value: control.value } };
            } else {
              return;
            }
          });
      }
    };
  }
}
