import { Component, OnDestroy, OnInit } from '@angular/core';
import { Collection, LearningObject } from '@entity';
import { CollectionService } from 'app/core/collection-module/collections.service';
import { NavbarService } from 'app/core/client-module/navbar.service';
import { TagsService } from 'app/core/learning-object-module/tags/tags.service';
import { SearchService } from 'app/core/learning-object-module/search/search.service';
import { OrderBy } from 'app/interfaces/query';


@Component({
  selector: 'clark-tag-with-cyber',
  templateUrl: './tag-with-cyber.component.html',
  styleUrls: ['./tag-with-cyber.component.scss']
})
export class TagWithCyberComponent implements OnInit, OnDestroy {
  abvCollection = 'withcyber';
  collection: Collection;
  learningObjects: LearningObject[];
  tagId: string;

  constructor(
    private navbarService: NavbarService,
    private collectionService: CollectionService,
    private tagsService: TagsService,
    private searchService: SearchService
  ) {}

  async ngOnInit() {
    this.navbarService.show();

    this.collection = await this.collectionService.getCollection(this.abvCollection);

    this.learningObjects = await this.getFeaturedLearningObjects();

    this.tagId = await this.tagsService.getTagIdByName('WITHcyber');

  }

  ngOnDestroy(): void {
    this.navbarService.hide();
  }

  async getFeaturedLearningObjects(){
    // get tag, return no LOs if no tag
    const tagId = await this.tagsService.getTagIdByName('WITHcyber');
    if (!tagId) {
      return [];
    }
    // for now we are just fetching the most recent 5 LOs for the featured section of the collection page
    const queryParams = { tags: [tagId], orderBy: OrderBy.Date, sortType: -1,  limit: 5 };
    const response = await this.searchService.getLearningObjects(queryParams);
    const list = response.learningObjects ?? [];
    return list;
  }
}
