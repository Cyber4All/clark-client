import { Component, OnInit } from '@angular/core';
import { Collection, CollectionService } from 'app/core/collection-module/collections.service';
import { ToastrOvenService } from '../../../../shared/modules/toaster/notification.service';
import { GoogleTagService } from '../../google-tag.service';


@Component({
  selector: 'clark-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss']
})
export class CollectionsComponent implements OnInit {

  collections = [];
  show = ['nccp', 'ncyte', 'intro_to_cyber'];

  constructor(
    private collectionService: CollectionService,
    private toastr: ToastrOvenService,
    public googleTagService: GoogleTagService
    ) { }

  async ngOnInit(): Promise<void> {
    //get collections
    await this.collectionService
    .getCollections()
    .then((collections: Collection[]) => {
      this.collections = collections;
    })
    .catch(e => {
      this.toastr.error('There was a problem!', 'There was an error fetching collections, please try again later.');
    });

    //filter for collections we want to show
    this.collections = this.collections.filter(value => this.show.includes(value.abvName));

  }

}
