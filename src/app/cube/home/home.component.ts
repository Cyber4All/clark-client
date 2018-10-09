import { LearningObjectService } from '../learning-object.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Query } from '../../shared/interfaces/query';
import { COPY } from './home.copy';
import { AuthService, AUTH_GROUP } from '../../core/auth.service';


@Component({
  selector: 'cube-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  copy = COPY;
  query: Query = {
    limit: 1,
    released: this.auth.group.value !== AUTH_GROUP.ADMIN ? true : undefined
  };
  placeholderText = 'Searching across ... learning objects';

  constructor(
    public learningObjectService: LearningObjectService,
    private router: Router,
    private auth: AuthService) { }

  ngOnInit() {
    this.learningObjectService.getLearningObjects(this.query).then((res) => {
      this.placeholderText = 'Searching across ' + res.total + ' learning objects';
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
