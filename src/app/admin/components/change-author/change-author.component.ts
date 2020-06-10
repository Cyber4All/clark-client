import { Component, OnInit, Input } from '@angular/core';
import { LearningObject, User } from '@entity';

@Component({
  selector: 'clark-change-author',
  templateUrl: './change-author.component.html',
  styleUrls: ['./change-author.component.scss']
})
export class ChangeAuthorComponent implements OnInit {

  finalStage: boolean = false;

  constructor() { }
  @Input() highlightedLearningObject: LearningObject;
  @Input() statusDescription;

  selectedAuthor: User;
  ngOnInit(): void {
  }

  toggleState(renderFinalStage: boolean){
    this.finalStage = renderFinalStage;
  }

  setSelectedAuthor(author){
    if(author){
      console.log('author exists ', author);

      this.selectedAuthor = author;
    }
  }
}
