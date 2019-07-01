import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy
} from '@angular/core';

import { StatusDescriptions } from 'environments/status-descriptions';
import { DashboardLearningObject } from 'app/onion/dashboard/dashboard.component';
import { ContextMenuService } from 'app/shared/contextmenu/contextmenu.service';
import { AuthService } from 'app/core/auth.service';
import { LearningObject } from '@entity';
import { environment } from '@env/environment';

@Component({
  selector: 'clark-learning-object-list-item',
  templateUrl: './learning-object-list-item.component.html',
  styleUrls: ['./learning-object-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LearningObjectListItemComponent implements OnChanges {
  @Input()
  learningObject: DashboardLearningObject;
  // the status of the learning object (passed in separately for change detection)
  @Input()
  status: string;

  // fired when the view user option is selected from the context menu
  @Output()
  viewUser: EventEmitter<string> = new EventEmitter();
  // Change status
  @Output()
  changeStatus: EventEmitter<LearningObject> = new EventEmitter();

  // id of the context menu returned from the context-menu component
  itemMenu: string;

  statusDescription: string;

  // flags
  meatballOpen = false;

  constructor(
    private contextMenuService: ContextMenuService,
    private auth: AuthService,
    private statuses: StatusDescriptions
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.status) {
      this.statuses
        .getDescription(
          changes.status.currentValue,
          this.learningObject.collection
        )
        .then(desc => {
          this.statusDescription = desc;
        });
    }
  }

  /**
   * Hides or shows the learning object context menu
   * @param event {MouseEvent} the event from which to grab the anchor element
   */
  toggleContextMenu(event: MouseEvent) {
    if (this.itemMenu) {
      if (!this.meatballOpen) {
        this.contextMenuService.open(
          this.itemMenu,
          event.currentTarget as HTMLElement,
          { top: 2, left: 10 }
        );
      } else {
        this.contextMenuService.destroy(this.itemMenu);
      }

      this.meatballOpen = !this.meatballOpen;
    } else {
      console.error('Error! Attempted to open an unregistered context menu!');
    }
  }

  /**
   * Check the logged in user's email verification status
   * @return {boolean} true if loggedin user has verified their email, false otherwise
   */
  get verifiedEmail(): boolean {
    return this.auth.user.emailVerified;
  }

}
