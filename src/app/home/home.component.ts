import { LearningObjectService } from './../learning-object.service';
import { Component, OnInit } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';
import { SortGroupsService } from '../shared/sort-groups.service';
import { Router } from '@angular/router';
import { TextQuery } from '../shared/interfaces/query';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  query: TextQuery = {
    text: '',
    currPage: 1,
    limit: 30
  };

  constructor(private learningObjectService: LearningObjectService, private sorter: SortGroupsService, private router: Router) { }

  ngOnInit() {
    document.querySelector('.search-bar input')['value'] = '';
  }

  keyDownSearch(event) {
    if (event.keyCode == 13) {
      this.search();
    }
  }
  search() {
    // TODO: verify query contains alphanumeric characters
    if (this.query.text === '') {
      this.learningObjectService.clearSearch();
    } else if (this.query !== undefined) {
      this.router.navigate(['/browse', { query: this.query.text }]);
    }
  }
  goToContribute() {
    window.location.href = 'http://onion.clark.center';
  }

}
