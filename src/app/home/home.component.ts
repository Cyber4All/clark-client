import { LearningObjectService } from './../learning-object.service';
import { Component, OnInit } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';
import { SortGroupsService } from '../shared/sort-groups.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  query: string;

  constructor(private learningObjectService: LearningObjectService, private sorter: SortGroupsService, private router:Router) { }

  ngOnInit() {
  }
  keyDownSearch(event) {
    if (event.keyCode == 13) {
      this.search();
    }
  }
  search() {
    // TODO: verify query contains alphanumeric characters
    if (this.query === '') {
      this.learningObjectService.clearSearch();
    } else if (this.query !== undefined) {
      this.router.navigate(['/browse', { query: this.query }]);
    }
  }
  goToContribute(){
    window.location.href = 'http://onion.clark.center';
  }

}
