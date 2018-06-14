import { LearningObjectService } from './../learning-object.service';
import { Component, OnInit } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';
import { Router } from '@angular/router';
import { TextQuery } from '../../shared/interfaces/query';


@Component({
  selector: 'cube-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  query: TextQuery = {
    text: '',
    currPage: 1,
    limit: 30
  };
  placeholderText: string;

  constructor(public learningObjectService: LearningObjectService, private router: Router) { }

  ngOnInit() {
    // document.querySelector('.search-bar input')['value'] = '';
    this.placeholderText = 'Searching ' + this.learningObjectService.totalLearningObjects + ' learning objects of cybersecurity curriculum';
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
      this.router.navigate(['/browse', { query: this.query.text }]);
    }
  }
  goToContribute() {
    this.router.navigate(['/onion']);
  }

}
