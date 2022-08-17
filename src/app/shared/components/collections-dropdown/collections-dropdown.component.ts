import { animate, sequence, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CollectionService, Collection } from '../../../core/collection.service';
import { ToastrOvenService } from '../../modules/toaster/notification.service';

@Component({
  selector: 'clark-collections-dropdown',
  templateUrl: './collections-dropdown.component.html',
  styleUrls: ['./collections-dropdown.component.scss'],
  animations: [
    trigger('dropDownMenu', [
      transition(':enter', [
        style({ height: 0, overflow: 'hidden' }),
        sequence([
          animate('200ms', style({ height: '1000px' })),
        ])
      ])
    ])
  ]
})
export class CollectionsDropdownComponent implements OnInit {

  collections: Collection[];

  @Output() close: EventEmitter<void> = new EventEmitter();
  constructor(
    private collectionService: CollectionService,
    private toastr: ToastrOvenService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.collectionService
    .getCollections()
    .then((collections: Collection[]) => {
      this.collections = collections;
    })
    .catch(e => {
      this.toastr.error('There was a problem!', 'There was an error fetching collections, please try again later.');
    });
  }

  activateClose() {
    this.close.emit();
  }

}
