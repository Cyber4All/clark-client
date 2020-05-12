import { Component, OnInit } from '@angular/core';
import { TopicService } from 'app/core/topic.service';

@Component({
  selector: 'clark-topic-browse',
  templateUrl: './topic-browse.component.html',
  styleUrls: ['./topic-browse.component.scss']
})
export class TopicBrowseComponent implements OnInit {

  topics: string[];

  constructor(private topicService: TopicService) { }

  ngOnInit() {
    this.topicService.getLearningObjectTopics()
      .then((topicResponse) => {
        this.topics = topicResponse.topics.sort();
      });
  }
}
