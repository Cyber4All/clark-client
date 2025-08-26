import { Component, OnDestroy, OnInit } from '@angular/core';
import { Collection, LearningObject } from '@entity';
import { CollectionService } from 'app/core/collection-module/collections.service';
import { FeaturedObjectsService } from 'app/core/feature-module/featured.service';
import { NavbarService } from 'app/core/client-module/navbar.service';
import { Title } from '@angular/platform-browser';
import { SEARCH_ROUTES } from 'app/core/learning-object-module/search/search.routes';
import { TAGS_ROUTES } from 'app/core/learning-object-module/tags/tags.routes';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';


interface TagsResponse {
  tags: { _id: string }[];
  total: number;
}
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
    private titleService: Title,
    private featureService: FeaturedObjectsService,
    private http: HttpClient) { }

  async ngOnInit() {
    this.navbarService.show();

    this.collection = await this.collectionService.getCollection(this.abvCollection);

    this.learningObjects = await this.getFeaturedLearningObjects();

    this.titleService.setTitle('CLARK | ' + this.collection.name);

    this.tagId = await this.getCorrectTag();

  }

  ngOnDestroy(): void {
    this.navbarService.hide();
  }

  async getFeaturedLearningObjects(){
    // get tag, return no LOs if no tag
    const tagId = await this.getCorrectTag();
    if (!tagId) {
      return [];
    }
    // for now we are just fetching the most recent 5 LOs for the featured section of the collection page
    const queryParams = new URLSearchParams({ tags: tagId, orderBy: 'date', sortType: '-1',  limit: '5' }).toString();
    const url = SEARCH_ROUTES.SEARCH_LEARNING_OBJECTS(queryParams);
    const res = await fetch(url, { method: 'GET' });
    const payload: { objects?: LearningObject[]; learningObjects?: LearningObject[]; total?: number } = await res.json();
    const list = payload.objects ?? payload.learningObjects ?? [];
    const top5 = list.slice(0, 5);
    return top5;
  }

  async getCorrectTag() {
    const url =  TAGS_ROUTES.GET_ALL_TAGS({ text: 'WITHCyber' });
    const res = await fetch(url, { method: 'GET' });
    const data: TagsResponse = await res.json();
    const tag =  data.tags?.[0]?._id ?? null;
    console.log('Tag ID: ', tag);
    return tag;
  }
}
