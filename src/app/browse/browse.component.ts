import { Router } from '@angular/router';
import { LearningObject } from '@cyber4all/clark-entity';
import { Component, OnInit } from '@angular/core';
import { LearningObjectService } from '../learning-object.service';
import { ActivatedRoute } from '@angular/router';
import { TextQuery } from '../shared/interfaces/query';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit {
  learningObjects: LearningObject[];
  private sub: any;
  query: TextQuery = {
    text: '',
    currPage: 1,
    limit: 30
  };
  pageCount: number;
  allTitle: string = "All Learning Objects";
  searchTitle: string = "Search Results";
  pageTitle: string;


  constructor(private learningObjectService: LearningObjectService, private route: ActivatedRoute, private router: Router) {
    this.sub = this.route.params.subscribe(params => {
      console.log(params);
      params['query'] ? this.query.text = params['query'] : this.query.text = '';
      this.fetchLearningObjects(this.query);
    });
  }

  ngOnInit() {
  }
  prevPage() {
    let page = +this.query.currPage - 1
    if (page > 0) {
      this.query.currPage = page;
      this.fetchLearningObjects(this.query);

    }

  }
  nextPage() {
    let page = +this.query.currPage + 1
    if (page <= this.pageCount){
      this.query.currPage =page
      this.fetchLearningObjects(this.query);
    }
  }

  async fetchLearningObjects(query: TextQuery) {
    this.pageTitle = this.allTitle;
    try {
      this.learningObjects = await this.learningObjectService.getLearningObjects(query);
      this.pageCount = Math.ceil(this.learningObjectService.totalLearningObjects / +this.query.limit);
      console.log(this.pageCount);
    } catch (e) {
      console.log(e);
    }
  }

}
