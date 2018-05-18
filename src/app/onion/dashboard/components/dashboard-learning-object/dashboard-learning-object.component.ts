import { Component, OnInit, Input, Output, SimpleChanges, OnChanges } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';
import { EventEmitter } from '@angular/core';
import { ModalListElement, ModalService } from 'app/shared/modals';
import { AuthService } from '../../../../core/auth.service';
import { encodeURIForRouter } from 'app/shared/pipes/encoded-url.pipe';
import { Router } from '@angular/router';
import { DashboardLearningObjectPanelComponent } from '../dashboard-learning-object-panel/dashboard-learning-object-panel.component';

@Component({
  selector: 'clark-dashboard-learning-object',
  templateUrl: './dashboard-learning-object.component.html',
  styleUrls: ['./dashboard-learning-object.component.scss']
})
export class DashboardLearningObjectComponent implements OnInit, OnChanges {
  expanded = false;
  // Inputs
  @Input('learningObject') learningObject: LearningObject;
  @Input('changeSelect') changeSelect: boolean;

  // Outputs
  selected = false;
  @Output('selectChanged') selectChanged: EventEmitter<boolean> = new EventEmitter();
  @Output('togglePublished') togglePublished: EventEmitter<any> = new EventEmitter();
  @Output('onDelete') onDelete: EventEmitter<any> = new EventEmitter();

  constructor(private modalService: ModalService, private auth: AuthService, private router: Router) {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.changeSelect) {
      if (changes.changeSelect.currentValue) {
        this.emitSelected();
      } else {
        this.emitDeselected();
      }
    }
  }

  emitSelected() {
    this.selected = true;
    this.selectChanged.emit(true);
  }

  emitDeselected() {
    this.selected = false;
    this.selectChanged.emit(false);
  }

   /**
   * Opens the learning object builder component and populates it with the active learning object
   */
  edit() {
    this.router.navigate([
      '/onion/learning-object-builder',
      encodeURIForRouter(this.learningObject.name)
    ]);
  }

  delete() {
    this.onDelete.emit();
  }

  makeContextMenu(event) {
    let list: Array<ModalListElement> = [
      new ModalListElement('<i class="far fa-edit"></i>Edit', 'edit')
    ];

    if (this.learningObject.length !== 'nanomodule') {
      list.push(new ModalListElement('<i class="far fa-child"></i>Edit Children', 'edit children'));
    }

    if (this.auth.user.emailVerified) {
      list.push(
        new ModalListElement(
          '<i class="far fa-upload"></i>Manage Materials',
          'upload'
        )
      );
    }

    if (!this.learningObject.published && this.auth.user.emailVerified) {
      list.push(
        new ModalListElement(
          '<i class="far fa-eye"></i>Publish',
          'toggle published'
        )
      );
    } else if (this.auth.user.emailVerified) {
      list.push(
        new ModalListElement(
          '<i class="far fa-eye-slash"></i>Unpublish',
          'toggle published'
        )
      );
      list.push(
        new ModalListElement(
          '<i class="far fa-cube"></i>View in CUBE',
          'view details'
        )
      );
    }
    list.push(
      new ModalListElement(
        '<i class="far fa-trash-alt"></i>Delete',
        'delete',
        'bad'
      )
    );

    this.modalService
      .makeContextMenu(
        'LearningObjectContext',
        'small',
        list,
        true,
        event.currentTarget
      )
      .subscribe(val => {
        switch (val) {
          case 'edit':
            this.edit();
            break;
          case 'edit children':
            this.expanded = !this.expanded;
            break;
          case 'delete':
            this.delete();
            break;
          case 'upload':
            this.router.navigate([
              '/onion/content/upload/' + encodeURIForRouter(this.learningObject.name)
            ]);
            break;
          case 'toggle published':
            this.togglePublished.emit();
            break;
          case 'view details':
            this.router.navigate([
              `/details/${this.learningObject.author.username}/${
                encodeURIForRouter(this.learningObject.name)
              }`
            ]);
            break;
          default:
            break;
        }
      });
  }

}
