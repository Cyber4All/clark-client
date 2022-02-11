import {Component, Input} from '@angular/core';
import {LearningObject} from '@entity';

@Component({
  selector: 'clark-editor-action-panel',
  templateUrl: './editor-action-panel.component.html',
  styleUrls: ['./editor-action-panel.component.scss']
})
export class EditorActionPanelComponent {

  @Input() learningObject: LearningObject;
  // id of the context menu returned from the context-menu component
  itemMenu: string;
  isMenuOpen = false;
  isModalOpen = false;

  constructor() {
  }

  changeStatus() {
    this.isModalOpen = true;
  }

  /**
   * Hides or shows the learning object context menu
   *
   * @param {boolean} [value] true if menu os open, false otherwise
   */
  toggleContextMenu(value?: boolean) {
    this.isMenuOpen = value;
  }
}
