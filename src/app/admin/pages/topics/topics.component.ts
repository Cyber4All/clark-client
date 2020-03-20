import { Component, OnInit } from '@angular/core';
import { LearningObject } from 'entity/learning-object/learning-object';
import { LearningObjectService } from 'app/core/learning-object.service';
import { Query } from 'app/interfaces/query';


@Component({
  selector: 'clark-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.scss']
})
export class TopicsComponent implements OnInit {
  
  objectKeys = Object.keys;

  learningObjects: LearningObject[];

  displayTopicsBuilderModal = false;

  discoveringTopics = false;

  newTopicDistribution = {};
  standardTopicDistribution = {};

  selectedTopicObjects = [];
  selectedTopicName = '';

  submissionGroup = {};
  
  query: Query = {
    currPage: 1,
    limit: 20,
    text: ''
  };

  constructor(private learningObjectService: LearningObjectService ) { }

  ngOnInit() {
    this.getLearningObjects();
  }

  async getLearningObjects() {
    const response = await this.learningObjectService.fetchUnassignedLearningObjects();
    this.learningObjects = response['unassigned_learning_objects'];
  }

  async discoverLearningObjectTopics() {
    this.discoveringTopics = true;
    const response = await this.learningObjectService.discoverLearningObjectTopics();
    this.newTopicDistribution = response['new_topics'];
    this.standardTopicDistribution = response['standard_topics'];
    this.selectedTopicObjects = this.newTopicDistribution[this.objectKeys(this.newTopicDistribution)[0]]
    this.selectedTopicName = this.objectKeys(this.newTopicDistribution)[0];
    this.discoveringTopics = false;
    this.displayTopicsBuilderModal = true;
  }

  selectStandardTopic(topicName: string) {
    this.selectedTopicObjects = this.standardTopicDistribution[topicName];
    this.selectedTopicName = topicName;
  }

  selectNewTopic(topicName: string) {
    this.selectedTopicObjects = this.newTopicDistribution[topicName];
    this.selectedTopicName = topicName;
  }

  toggleTopicToSubmissionGroup(isSelected: boolean, topicName: string) {
    if (isSelected) {
      // If the checkbox is selected, add the topic the submission group
      const topicDistribution = this.newTopicDistribution[topicName] ? this.newTopicDistribution : this.standardTopicDistribution;
      this.submissionGroup[topicName] = topicDistribution[topicName];
    } else {
      // If the checkbox is unselected, remove the topic from the submissin group
      delete this.submissionGroup[topicName];
    }
  }

  changeNewTopicName() {

  } 

  submitChanges() {
    console.log(this.submissionGroup);
  }
}
