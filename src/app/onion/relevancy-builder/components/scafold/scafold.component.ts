import {
  Component,
  OnInit,
  Input
} from '@angular/core';
import { BuilderStore } from '../../builder-store.service';
import { LearningObject } from '@entity';

@Component({
  selector: 'clark-relevancy-scafold',
  templateUrl: './scafold.component.html',
  styleUrls: ['./scafold.component.scss']
})
export class ScafoldComponent implements OnInit {

  @Input() learningObject: LearningObject;

  ariaLabel: string;

  // array to obtain stored topics
  topics: string[];
  taggedTopics: string[];

  // boolean to toggle tag styles
  tagged: boolean;

  // flags
  loading: boolean;

  // boolean to indicate if edit is selected for the list
  @Input() editContent: boolean;

  constructor(
    private store: BuilderStore
  ) { }

  ngOnInit() {
    this.loading = true;
    this.ariaLabel = 'Add and delete Topics';
    this.topics = this.store.getTopics();
    this.loading = false;
  }

  toggleTopics(topic: any) {
    if (this.taggedTopics.includes(topic.id)) {
      this.tagged = false;
      this.taggedTopics = this.taggedTopics.filter((t) => {
        return t !== topic.id;
      });
    } else {
      this.tagged = true;
      this.taggedTopics.push(topic.id);
    }
  }

}
