import { NgModule } from '@angular/core';
import { ChangelogItemComponent } from './changelog-item/changelog-item.component';
import { ChangelogListComponent } from './changelog-list/changelog-list.component';
import { ChangelogModalComponent } from './changelog-modal/changelog-modal.component';
import { IdentificationPillComponent } from './identification-pill/identification-pill.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [ CommonModule ],
  declarations: [ChangelogItemComponent, ChangelogListComponent, ChangelogModalComponent, IdentificationPillComponent],
  exports: [ChangelogItemComponent, ChangelogListComponent, ChangelogModalComponent, IdentificationPillComponent],
})
export class ChangeLogModule { }
