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

type TagsResponse = {
  tags: { _id: string }[];
  total: number;
};
@Component({
  selector: 'clark-tag-with-cyber',
  templateUrl: './tag-with-cyber.component.html',
  styleUrls: ['./tag-with-cyber.component.scss']
})
export class TagWithCyberComponent implements OnInit, OnDestroy {

  abvCollection = 'withcyber';
  collection: Collection;
  learningObjects: LearningObject[];

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

    
  }

  ngOnDestroy(): void {
    this.navbarService.hide();
  }

  async getFeaturedLearningObjects(){
    const response = await this.http
          .get(SEARCH_ROUTES.SEARCH_LEARNING_OBJECTS(`tags=${await this.getCorrectTag()}&sortType=-1`))
          .pipe(catchError(this.handleError))
          .toPromise();
        return response as LearningObject[];
  }
  async getCorrectTag() {
    const url =  TAGS_ROUTES.GET_ALL_TAGS({ text: "WITHCyber" });
    const res = await fetch(url, { method: "GET" });
    const data: TagsResponse = await res.json();
   
    const tagid =  data.tags?.[0]?._id ?? null;
    console.log("tagID: ",tagid);
    return tagid; 
  }

   private handleError(error: HttpErrorResponse) {
      if (error.error instanceof ErrorEvent) {
        // Client-side or network returned error
        return throwError(error.error.message);
      } else {
        // API returned error
        return throwError(error);
      }
    }
}