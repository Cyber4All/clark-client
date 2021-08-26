import {
  Component,
  OnInit,
} from '@angular/core';
import { BuilderStore } from '../../builder-store.service';
import { Topic } from '@entity';

@Component({
  selector: 'clark-relevancy-scafold',
  templateUrl: './scafold.component.html',
  styleUrls: ['./scafold.component.scss']
})
export class ScafoldComponent implements OnInit {
  ariaLabel: string;

  // array to obtain stored topics
  topics: Topic[];
  // array to track tags for learning object
  taggedTopics: string[] = [];

  // boolean to toggle tag styles
  tagged: boolean;

  // flags
  loading: boolean;

  constructor(
    private store: BuilderStore
  ) { }

  async ngOnInit() {
    this.loading = true;
    this.ariaLabel = 'Add and delete Topics';
    this.topics = await this.store.getTopics();
    this.loading = false;
  }

  toggleTopics(topic: any) {
    if (this.taggedTopics.includes(topic._id)) {
      this.tagged = false;
      this.taggedTopics = this.taggedTopics.filter((t) => {
        return t !== topic._id;
      });
    } else {
      this.tagged = true;
      this.taggedTopics.push(topic._id);
    }
    this.store.storeTopics(this.taggedTopics);
  }

}
