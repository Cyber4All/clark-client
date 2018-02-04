import { LearningObject } from '@cyber4all/clark-entity';
import { Component, OnInit } from '@angular/core';
import { LearningObjectService } from '../learning-object.service';
import { ActivatedRoute } from '@angular/router';
import { TextQuery } from '../home/home.component';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit {
  learningObjects: LearningObject[];
  private sub: any;
  query: TextQuery = {
    text: ''
  };
  allTitle: string = "All Learning Objects";
  searchTitle: string = "Search Results";
  pageTitle: string;


  constructor(private learningObjectService: LearningObjectService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.query.text = params['query'];
      this.query.text ? this.getFilteredObjects(this.query) : this.fetchLearningObjects();
    });
  }

  async getFilteredObjects(query: TextQuery) {
    this.pageTitle = this.searchTitle;
    this.learningObjects = await this.learningObjectService.search(query);
  }
  async fetchLearningObjects() {
    this.pageTitle = this.allTitle;
    this.learningObjects = await this.learningObjectService.getLearningObjects();
  }

}
