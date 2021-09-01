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
    this.store.getTopics().then(( topics ) => {
      this.topics = topics.sort(( a, b ) => ( a.name > b.name ) ? 1 : (( b.name > a.name ) ? -1 : 0) );
    });
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
