import { Component, OnInit, Input } from '@angular/core';
import { User } from '@cyber4all/clark-entity';
import { UserService } from '../../core/user.service';

@Component({
  selector: 'clark-learning-object-ratings',
  templateUrl: './learning-object-ratings.component.html',
  styleUrls: ['./learning-object-ratings.component.scss']
})
export class LearningObjectRatingsComponent implements OnInit {

  @Input() ratings: {user: User, number: number, comment: string, date: string}[];

  constructor(public userService: UserService) { }

  ngOnInit() {}

  get averageRating(): number {
    return this.ratings.map(x => x.number).reduce((x, y) => x + y) / this.ratings.length;
  }

  getDate(seconds: string): Date {
    const t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(parseInt(seconds, 10));
    return t;
  }

}
