import {Component, Input} from '@angular/core';
import {ContextMenuService} from '../../../../shared/contextmenu/contextmenu.service';
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

  constructor(private contextMenuService: ContextMenuService, ) {
  }

  changeStatus() {
    this.isModalOpen = true;
  }

  /**
   * Hides or shows the learning object context menu
   * @param event {MouseEvent} the event from which to grab the anchor element
   */
  toggleContextMenu(event) {
    if (this.itemMenu) {
      if (!this.isMenuOpen) {
        this.contextMenuService.open(this.itemMenu, event.currentTarget as HTMLElement, {top: 5, left: -10});
      } else {
        this.contextMenuService.destroy(this.itemMenu);
      }
      this.isMenuOpen = !this.isMenuOpen;
    } else {
      console.error('Error! Attempted to open an unregistered context menu!');
    }
  }
}
