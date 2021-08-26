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

  // boolean to toggle tag styles
  tagged: boolean;

  // flags
  loading: boolean;

  constructor(
    public store: BuilderStore
  ) { }

  async ngOnInit() {
    this.loading = true;
    this.ariaLabel = 'Add and delete Topics';
    this.topics = await this.store.getTopics();
    this.loading = false;
  }

  /**
   * This toggles the list of selected topics on and off
   * for a given learning object
   *
   * @param topic The topic toggling on/off
   */
  toggleTopics(topic: any) {
    let tagged = this.store.topics;
    if (tagged.includes(topic._id)) {
      this.tagged = false;
      tagged = tagged.filter((t) => {
        return t !== topic._id;
      });
    } else {
      this.tagged = true;
      tagged.push(topic._id);
    }
    this.store.storeTopics(tagged);
  }

}
