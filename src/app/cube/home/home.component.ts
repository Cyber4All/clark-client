import { LearningObjectService } from '../learning-object.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Query } from '../../shared/interfaces/query';
import { COPY } from './home.copy';
import { AuthService } from '../../core/auth.service';
import { CollectionService, Collection } from '../../core/collection.service';


@Component({
  selector: 'cube-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  copy = COPY;
  query: Query = {
    limit: 1,
    released: this.auth.hasPrivelagedAccess() ? undefined : true
  };
  placeholderText = this.copy.SEARCH_PLACEHOLDER;
  collections: Collection[];
  releasedCounter: number;
  totalCounter: number;

  constructor(
    public learningObjectService: LearningObjectService,
    private router: Router,
    private auth: AuthService,
    private collectionService: CollectionService
    ) { }

  ngOnInit() {
    this.learningObjectService.getLearningObjects({ limit: 1, released: true }).then((res) => {
      this.releasedCounter = res.total;
    });
    this.learningObjectService.getLearningObjects({ limit: 1 }).then((res) => {
      this.totalCounter = res.total;
    });
    this.collectionService.getCollections()
      .then(collections => {
        this.collections = collections.filter(c => c.abvName === 'nccp' || c.abvName === 'c5');
      })
      .catch(e => {
        console.error(e.message);
      });
  }
  keyDownSearch(event) {
    if (event.keyCode === 13) {
      this.search();
    }
  }
  search() {
    this.query.text = this.query.text.trim();
    if (this.query.text === '') {
      this.learningObjectService.clearSearch();
    } else if (this.query !== undefined) {
      this.router.navigate(['/browse'], {queryParams:  {text: this.query.text }});
    }
  }
  goToContribute() {
    this.router.navigate(['/onion']);
  }

}
