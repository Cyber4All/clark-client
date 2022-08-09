import { Component, OnInit } from '@angular/core';
import { CollectionService, Collection } from '../../../core/collection.service';
import { ToastrOvenService } from '../../modules/toaster/notification.service';

@Component({
  selector: 'clark-collections-dropdown',
  templateUrl: './collections-dropdown.component.html',
  styleUrls: ['./collections-dropdown.component.scss']
})
export class CollectionsDropdownComponent implements OnInit {

  collections: Collection[]; 

  constructor(
    private collectionService: CollectionService,
    private toastr: ToastrOvenService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.collectionService
    .getCollections()
    .then((collections: Collection[]) => {
      this.collections = collections.filter(c=>{return c.abvName !== 'deterlab'});
    })
    .catch(e => {
      this.toastr.error("There was a problem!", "There was an error fetching collections, please try again later.");
    });

    this.collections.filter(c => {c.abvName !== 'deterlab'})
  }

}
