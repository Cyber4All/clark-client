import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Topic } from '@entity';
import { RelevancyService } from '../../../../core/relevancy.service';

@Component({
  selector: 'clark-teach-now',
  templateUrl: './teach-now.component.html',
  styleUrls: ['./teach-now.component.scss']
})
export class TeachNowComponent implements OnInit, AfterViewInit {

  topics: Topic[] = [];
  topicScroll: HTMLElement;

  constructor(
    private relevancyService: RelevancyService,
  ) { }

  ngOnInit(): void {
    this.relevancyService.getTopics().then(topics => {
      this.topics = topics;
    });
  }

  ngAfterViewInit(): void {
    this.topicScroll = document.getElementById('teach-now-topics');
    this.topicScroll.addEventListener('wheel', this.horizontalScroll.bind(this));
  }

  /**
   * Handles auto scrolling horizontally over the topics they can search by
   *
   * @param event The scroll event
   */
  horizontalScroll(event) {
    this.topicScroll.scrollLeft += event.deltaY;
    event.preventDefault();
  }

}
